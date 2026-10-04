-- Apply after schema.sql. Test auto-accept exists only in the browser preview.
begin;
create table if not exists public.campus_clubs (
  id text primary key,
  name text not null
);
create table if not exists public.club_admins (
  club_id text not null references public.campus_clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (club_id, user_id)
);
create table if not exists public.club_memberships (
  club_id text not null references public.campus_clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  primary key (club_id, user_id)
);
create table if not exists public.club_events (
  id text primary key,
  club_id text not null references public.campus_clubs(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  location text not null,
  unique (id, club_id)
);
create table if not exists public.club_announcements (
  id uuid primary key default gen_random_uuid(),
  club_id text not null references public.campus_clubs(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 160),
  body text not null check (length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);
create table if not exists public.club_rsvps (
  event_id text not null,
  club_id text not null,
  user_id uuid not null,
  primary key (event_id, user_id),
  foreign key (event_id, club_id) references public.club_events(id, club_id) on delete cascade,
  foreign key (club_id, user_id) references public.club_memberships(club_id, user_id) on delete cascade
);

create or replace function public.manages_club(p_club text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(public.current_campus_role() = 'Admin', false) or exists (
    select 1 from public.club_admins where club_id = p_club and user_id = auth.uid()
  )
$$;
create or replace function public.joined_club(p_club text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.club_memberships where club_id = p_club and user_id = auth.uid() and status = 'approved')
$$;

alter table public.campus_clubs enable row level security;
alter table public.club_admins enable row level security;
alter table public.club_memberships enable row level security;
alter table public.club_events enable row level security;
alter table public.club_announcements enable row level security;
alter table public.club_rsvps enable row level security;

drop policy if exists club_directory on public.campus_clubs;
create policy club_directory on public.campus_clubs for select to authenticated using (true);
drop policy if exists club_admin_directory on public.club_admins;
create policy club_admin_directory on public.club_admins for select to authenticated using (user_id = auth.uid() or public.current_campus_role() = 'Admin');
drop policy if exists club_membership_read on public.club_memberships;
create policy club_membership_read on public.club_memberships for select to authenticated using (
  user_id = auth.uid() or public.manages_club(club_id) or (status = 'approved' and public.joined_club(club_id))
);
drop policy if exists club_event_read on public.club_events;
create policy club_event_read on public.club_events for select to authenticated using (public.joined_club(club_id) or public.manages_club(club_id));
drop policy if exists club_announcement_read on public.club_announcements;
create policy club_announcement_read on public.club_announcements for select to authenticated using (public.joined_club(club_id) or public.manages_club(club_id));
drop policy if exists club_announcement_write on public.club_announcements;
create policy club_announcement_write on public.club_announcements for insert to authenticated with check (public.manages_club(club_id));
drop policy if exists club_rsvp_read on public.club_rsvps;
create policy club_rsvp_read on public.club_rsvps for select to authenticated using (
  (user_id = auth.uid() and public.joined_club(club_id)) or public.manages_club(club_id)
);

-- Mutations go through the functions below; clients cannot approve themselves.
revoke all on public.campus_clubs, public.club_admins, public.club_memberships, public.club_events, public.club_announcements, public.club_rsvps from anon, authenticated;
grant select on public.campus_clubs, public.club_admins, public.club_memberships, public.club_events, public.club_announcements, public.club_rsvps to authenticated;
grant insert on public.club_announcements to authenticated;

create or replace function public.club_membership_action(p_club text, p_action text, p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_status text;
begin
  if auth.uid() is null or p_user is null then raise exception 'Sign in first'; end if;
  if not exists (select 1 from public.campus_clubs where id = p_club) then raise exception 'Unknown club'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_club || ':' || p_user::text, 0));
  select status into v_status from public.club_memberships where club_id = p_club and user_id = p_user;
  if p_action = 'request' then
    if p_user <> auth.uid() or public.current_campus_role() is distinct from 'Student' then raise exception 'Only students can request their own membership'; end if;
    if v_status in ('pending', 'approved') then return; end if;
    insert into public.club_memberships (club_id, user_id, display_name, status)
      select p_club, p_user, coalesce(nullif(full_name, ''), 'Campus member'), 'pending' from public.profiles where id = p_user
      on conflict (club_id, user_id) do update set status = 'pending', display_name = excluded.display_name;
  elsif p_action in ('approve', 'reject') then
    if not public.manages_club(p_club) then raise exception 'Only this club admin can review requests'; end if;
    if v_status is distinct from 'pending' then raise exception 'Request is no longer pending'; end if;
    update public.club_memberships set status = case when p_action = 'approve' then 'approved' else 'rejected' end where club_id = p_club and user_id = p_user;
  elsif p_action = 'leave' then
    if p_user <> auth.uid() then raise exception 'You can only leave for yourself'; end if;
    delete from public.club_memberships where club_id = p_club and user_id = p_user;
  else raise exception 'Unknown membership action';
  end if;
end;
$$;

create or replace function public.club_rsvp(p_event text, p_attending boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_club text;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select club_id into v_club from public.club_events where id = p_event;
  if v_club is null then raise exception 'Event not found'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_club || ':' || auth.uid()::text, 0));
  if not public.joined_club(v_club) then raise exception 'Join this club before you RSVP'; end if;
  if p_attending then
    insert into public.club_rsvps(event_id, club_id, user_id) values(p_event, v_club, auth.uid()) on conflict do nothing;
  else
    delete from public.club_rsvps where event_id = p_event and user_id = auth.uid();
  end if;
end;
$$;

revoke all on function public.manages_club(text), public.joined_club(text), public.club_membership_action(text,text,uuid), public.club_rsvp(text,boolean) from public, anon;
grant execute on function public.manages_club(text), public.joined_club(text), public.club_membership_action(text,text,uuid), public.club_rsvp(text,boolean) to authenticated;

-- Seed catalog and member content below. Re-running does not duplicate announcements.

insert into public.campus_clubs(id,name) values ('ieee','IEEE') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('ieee-welcome','ieee','Circuit design lab','2026-10-24 16:00:00+05:30','Electronics Lab') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'ieee','Welcome to IEEE','Bring your breadboard to this week''s circuit design lab.' where not exists (select 1 from public.club_announcements where club_id='ieee' and title='Welcome to IEEE');

insert into public.campus_clubs(id,name) values ('singing','Singing') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('singing-welcome','singing','Acoustic open mic','2026-10-24 16:00:00+05:30','Music Room') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'singing','Welcome to Singing','Sign up for a solo or duet at our next open mic.' where not exists (select 1 from public.club_announcements where club_id='singing' and title='Welcome to Singing');

insert into public.campus_clubs(id,name) values ('dancing','Dancing') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('dancing-welcome','dancing','Contemporary dance workshop','2026-10-24 16:00:00+05:30','Dance Studio') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'dancing','Welcome to Dancing','Wear comfortable clothes and bring water for rehearsal.' where not exists (select 1 from public.club_announcements where club_id='dancing' and title='Welcome to Dancing');

insert into public.campus_clubs(id,name) values ('photography','Photography') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('photography-welcome','photography','Golden hour photo walk','2026-10-24 16:00:00+05:30','Library Steps') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'photography','Welcome to Photography','Phones and cameras are both welcome on our photo walk.' where not exists (select 1 from public.club_announcements where club_id='photography' and title='Welcome to Photography');

insert into public.campus_clubs(id,name) values ('robotics','Robotics') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('robotics-welcome','robotics','Line follower build night','2026-10-24 16:00:00+05:30','Innovation Lab') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'robotics','Welcome to Robotics','Our build teams will share their sensor prototypes this week.' where not exists (select 1 from public.club_announcements where club_id='robotics' and title='Welcome to Robotics');

insert into public.campus_clubs(id,name) values ('drama','Drama') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('drama-welcome','drama','Improv and stage workshop','2026-10-24 16:00:00+05:30','Black Box Theatre') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'drama','Welcome to Drama','Auditions are open to beginners and experienced performers.' where not exists (select 1 from public.club_announcements where club_id='drama' and title='Welcome to Drama');

insert into public.campus_clubs(id,name) values ('debate','Debate') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('debate-welcome','debate','Parliamentary debate practice','2026-10-24 16:00:00+05:30','Seminar Hall') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'debate','Welcome to Debate','This week''s motion will be revealed at practice.' where not exists (select 1 from public.club_announcements where club_id='debate' and title='Welcome to Debate');

insert into public.campus_clubs(id,name) values ('coding','Coding') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('coding-welcome','coding','Campus hack night','2026-10-24 16:00:00+05:30','Computer Lab') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'coding','Welcome to Coding','Bring a laptop and an idea; teams will form at hack night.' where not exists (select 1 from public.club_announcements where club_id='coding' and title='Welcome to Coding');

insert into public.campus_clubs(id,name) values ('design','Design Society') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('design-welcome','design','Poster jam','2026-10-24 16:00:00+05:30','Design Studio') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'design','Welcome to Design Society','Share your poster draft for a friendly peer critique.' where not exists (select 1 from public.club_announcements where club_id='design' and title='Welcome to Design Society');

insert into public.campus_clubs(id,name) values ('green','Green Collective') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('green-welcome','green','Campus garden morning','2026-10-24 16:00:00+05:30','Community Garden') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'green','Welcome to Green Collective','Gloves and tools are provided for our next garden morning.' where not exists (select 1 from public.club_announcements where club_id='green' and title='Welcome to Green Collective');

insert into public.campus_clubs(id,name) values ('ai_ds','AI & Data Science') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('ai_ds-welcome','ai_ds','Transformer models from scratch','2026-10-25 18:00:00+05:30','Ramanujan Lab') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'ai_ds','Welcome to AI & Data Science','Join our paper discussion on state-of-the-art vision transformers this Wednesday.' where not exists (select 1 from public.club_announcements where club_id='ai_ds' and title='Welcome to AI & Data Science');

insert into public.campus_clubs(id,name) values ('aerospace','Aerospace & Rocketry') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('aerospace-welcome','aerospace','Solid motor static fire test','2026-10-25 10:00:00+05:30','North Campus Hangar') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'aerospace','Welcome to Aerospace & Rocketry','Safety briefing for this weekend''s static motor burn starts Thursday at 5 PM.' where not exists (select 1 from public.club_announcements where club_id='aerospace' and title='Welcome to Aerospace & Rocketry');

insert into public.campus_clubs(id,name) values ('cybersec','Cybersecurity') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('cybersec-welcome','cybersec','Web exploit & SQL injection clinic','2026-10-24 18:00:00+05:30','Shannon Hall Sandbox') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'cybersec','Welcome to Cybersecurity','Bring your laptop with Kali Linux installed for this Friday''s web exploitation clinic.' where not exists (select 1 from public.club_announcements where club_id='cybersec' and title='Welcome to Cybersecurity');

insert into public.campus_clubs(id,name) values ('film','Film Society') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('film-welcome','film','48-Hour Film screening night','2026-10-24 18:30:00+05:30','Black Box Screening Room') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'film','Welcome to Film Society','Popcorn provided! Join us for student short film premieres this Friday night.' where not exists (select 1 from public.club_announcements where club_id='film' and title='Welcome to Film Society');

insert into public.campus_clubs(id,name) values ('finearts','Fine Arts') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('finearts-welcome','finearts','Plein air watercolor afternoon','2026-10-24 15:00:00+05:30','Botanical Garden') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'finearts','Welcome to Fine Arts','Plein air watercolor kits and boards will be provided at the Botanical Garden pond.' where not exists (select 1 from public.club_announcements where club_id='finearts' and title='Welcome to Fine Arts');

insert into public.campus_clubs(id,name) values ('lit','Literary Society') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('lit-welcome','lit','Spoken word & open mic night','2026-10-24 18:00:00+05:30','Library Amphitheater') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'lit','Welcome to Literary Society','Step up to the mic or listen in; poetry, flash fiction, and monologues welcome.' where not exists (select 1 from public.club_announcements where club_id='lit' and title='Welcome to Literary Society');

insert into public.campus_clubs(id,name) values ('fashion','Fashion & Apparel') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('fashion-welcome','fashion','Denim upcycling & patchwork clinic','2026-10-24 16:00:00+05:30','Textile Studio 3') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'fashion','Welcome to Fashion & Apparel','Bring an old pair of jeans; sewing machines and embroidery threads will be ready.' where not exists (select 1 from public.club_announcements where club_id='fashion' and title='Welcome to Fashion & Apparel');

insert into public.campus_clubs(id,name) values ('music_band','Music Band') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('music_band-welcome','music_band','Open jam & band mixer night','2026-10-24 18:00:00+05:30','Jam Studio 3') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'music_band','Welcome to Music Band','Bring your guitar or sticks; amps and drums are hooked up and ready to jam.' where not exists (select 1 from public.club_announcements where club_id='music_band' and title='Welcome to Music Band');

insert into public.campus_clubs(id,name) values ('culinary','Culinary Arts') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('culinary-welcome','culinary','Artisan sourdough & focaccia workshop','2026-10-25 11:00:00+05:30','Culinary Kitchen 2') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'culinary','Welcome to Culinary Arts','Flour and proofing baskets ready! Learn dough shaping and rosemary focaccia baking this Saturday.' where not exists (select 1 from public.club_announcements where club_id='culinary' and title='Welcome to Culinary Arts');

insert into public.campus_clubs(id,name) values ('philosophy','Philosophy') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('philosophy-welcome','philosophy','Socratic dialogue on AI minds & ethics','2026-10-24 18:00:00+05:30','Humanities Quad Room 101') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'philosophy','Welcome to Philosophy','Can machines suffer? Join our Socratic circle on digital minds and ethical moral patienthood.' where not exists (select 1 from public.club_announcements where club_id='philosophy' and title='Welcome to Philosophy');

insert into public.campus_clubs(id,name) values ('ecell','E-Cell') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('ecell-welcome','ecell','Pitch deck teardown & VC mixer','2026-10-24 17:30:00+05:30','Innovation Tower Lounge') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'ecell','Welcome to E-Cell','Present your 3-minute startup elevator pitch to visiting angel investors for immediate feedback.' where not exists (select 1 from public.club_announcements where club_id='ecell' and title='Welcome to E-Cell');

insert into public.campus_clubs(id,name) values ('mun','Model UN & Diplomacy') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('mun-welcome','mun','UN Security Council crisis simulation','2026-10-24 17:00:00+05:30','Tagore Diplomatic Room 201') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'mun','Welcome to Model UN','Country country allotments for the crisis simulation are posted; study your dossier.' where not exists (select 1 from public.club_announcements where club_id='mun' and title='Welcome to Model UN');

insert into public.campus_clubs(id,name) values ('social_service','Social Impact') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('social_service-welcome','social_service','Weekend school tutoring & literacy camp','2026-10-25 09:00:00+05:30','Campus Classrooms 101-105') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'social_service','Welcome to Social Impact','Join us this Saturday morning to tutor local kids in math and reading; lesson kits provided.' where not exists (select 1 from public.club_announcements where club_id='social_service' and title='Welcome to Social Impact');

insert into public.campus_clubs(id,name) values ('wellness','Mind & Wellness') on conflict (id) do update set name = excluded.name;
insert into public.club_events(id,club_id,title,starts_at,location) values ('wellness-welcome','wellness','Sunrise yoga & breathwork on the quad','2026-10-25 07:00:00+05:30','Central Quad Lawn') on conflict (id) do nothing;
insert into public.club_announcements(club_id,title,body) select 'wellness','Welcome to Mind & Wellness','Yoga mats provided! Start your Sunday with gentle sun salutations and calming breathwork.' where not exists (select 1 from public.club_announcements where club_id='wellness' and title='Welcome to Mind & Wellness');

commit;

-- Assign a club admin using an existing profile UUID:
-- insert into public.club_admins(club_id,user_id) values ('ieee', 'PROFILE_UUID');
