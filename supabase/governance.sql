/* Club authority and treasury workflow. Apply after schema.sql and clubs.sql. */
begin;
create table if not exists public.club_faculty (
  club_id text not null references public.campus_clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key(club_id,user_id)
);
create table if not exists public.club_accounts (
  id text primary key,
  balance bigint not null default 0 check(balance between 0 and 9000000000000000)
);
insert into public.club_accounts(id) select id from public.campus_clubs on conflict do nothing;
insert into public.club_accounts(id) values('council') on conflict do nothing;
create table if not exists public.club_requests (
  id uuid primary key default gen_random_uuid(),
  club_id text not null references public.campus_clubs(id),
  kind text not null check(kind in ('funding','expense','event','announcement','activity','membership')),
  title text not null check(length(trim(title)) between 1 and 160),
  body text not null check(length(trim(body)) between 1 and 5000),
  amount bigint not null default 0 check(amount between 0 and 100000000000),
  status text not null check(status in ('pending_faculty','pending_admin','approved_funding','completed','rejected','cancelled')),
  created_by uuid not null references public.profiles(id),
  creator_name text not null,
  created_at timestamptz not null default now(),
  details jsonb not null default '{}',
  history jsonb not null default '[]'
);
create index if not exists club_requests_club_status on public.club_requests(club_id,status);
create unique index if not exists pending_membership_decision on public.club_requests(club_id,(details->>'target')) where kind='membership' and status='pending_faculty';
create table if not exists public.club_ledger (
  id uuid primary key default gen_random_uuid(),
  account_id text not null references public.club_accounts(id),
  amount bigint not null check(amount <> 0),
  kind text not null check(kind in ('receipt','funding_out','funding_in','expense')),
  description text not null,
  request_id uuid references public.club_requests(id),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(request_id,account_id,kind)
);
create unique index if not exists treasury_receipt_reference on public.club_ledger(description) where kind='receipt';
create or replace function public.supervises_club(p_club text)
returns boolean language sql stable security definer set search_path='' as $$
 select coalesce(public.current_campus_role()='Admin',false) or (public.current_campus_role()='Faculty' and exists(select 1 from public.club_faculty where club_id=p_club and user_id=auth.uid()))
$$;
create or replace function public.leads_club(p_club text)
returns boolean language sql stable security definer set search_path='' as $$
 select coalesce(public.current_campus_role()='Club Leader',false) and exists(select 1 from public.club_admins where club_id=p_club and user_id=auth.uid())
$$;
-- Existing content-read policies call manages_club; both assigned staff roles can read.
create or replace function public.manages_club(p_club text)
returns boolean language sql stable security definer set search_path='' as $$
 select coalesce(public.supervises_club(p_club),false) or coalesce(public.leads_club(p_club),false)
$$;
alter table public.club_faculty enable row level security;
alter table public.club_accounts enable row level security;
alter table public.club_requests enable row level security;
alter table public.club_ledger enable row level security;
drop policy if exists faculty_assignments_read on public.club_faculty;
create policy faculty_assignments_read on public.club_faculty for select to authenticated using(user_id=auth.uid() or public.current_campus_role()='Admin');
drop policy if exists account_read on public.club_accounts;
create policy account_read on public.club_accounts for select to authenticated using(public.current_campus_role() in ('Admin','Student Council') or public.manages_club(id));
drop policy if exists request_read on public.club_requests;
create policy request_read on public.club_requests for select to authenticated using(
 public.current_campus_role()='Admin' or public.manages_club(club_id) or (public.current_campus_role()='Student Council' and kind='funding') or (kind='activity' and status='completed' and public.joined_club(club_id))
);
drop policy if exists ledger_read on public.club_ledger;
create policy ledger_read on public.club_ledger for select to authenticated using(public.current_campus_role() in ('Admin','Student Council') or public.manages_club(account_id));
revoke all on public.club_faculty,public.club_accounts,public.club_requests,public.club_ledger from anon,authenticated;
grant select on public.club_faculty,public.club_accounts,public.club_requests,public.club_ledger to authenticated;
revoke insert on public.club_announcements from authenticated;
-- Legacy actions must not bypass the new approval or financial workflow.
drop policy if exists governance_legacy_insert on public.campus_records;
create policy governance_legacy_insert on public.campus_records as restrictive for insert to authenticated with check(
 case when kind='finance_entry' then false
 when kind='event' then public.current_campus_role()='Admin'
 when kind in ('task','announcement') then public.current_campus_role() in ('Admin','Student Council')
 when kind='volunteer_application' and payload->>'role'='organizer_post' then public.current_campus_role() in ('Admin','Student Council')
 else true end
);
drop policy if exists governance_legacy_update on public.campus_records;
create policy governance_legacy_update on public.campus_records as restrictive for update to authenticated using(
 kind <> 'finance_entry' and (kind not in ('event','task','announcement') or public.current_campus_role()='Admin')
) with check(kind <> 'finance_entry' and (kind not in ('event','task','announcement') or public.current_campus_role()='Admin'));
drop policy if exists governance_legacy_delete on public.campus_records;
create policy governance_legacy_delete on public.campus_records as restrictive for delete to authenticated using(
 kind <> 'finance_entry' and (kind not in ('event','task','announcement') or public.current_campus_role()='Admin')
);

create or replace function public.club_governance(p_command jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare
 v_action text := p_command->>'action';
 v_role text := public.current_campus_role();
 v_user uuid := auth.uid();
 v_club text := p_command->>'club_id';
 v_kind text := p_command->>'kind';
 v_title text := trim(p_command->>'title');
 v_body text := trim(p_command->>'body');
 v_amount numeric := coalesce((p_command->>'amount')::numeric,0);
 v_note text := coalesce(trim(p_command->>'note'),'');
 v_details jsonb := coalesce(p_command->'details','{}');
 v_name text;
 v_audit jsonb;
 v_request public.club_requests%rowtype;
 v_balance bigint;
 v_target uuid;
begin
 if v_user is null or v_role is null then raise exception 'Sign in with a valid campus profile first'; end if;
 if length(v_note)>1000 then raise exception 'Review note is too long'; end if;
 select coalesce(nullif(full_name,''),'Campus member') into v_name from public.profiles where id=v_user;
 v_audit := jsonb_build_array(jsonb_build_object('actor',v_name,'role',v_role,'action',v_action,'note',v_note,'at',now()));
 if v_action='deposit' then
  if v_role is distinct from 'Student Council' then raise exception 'Only Student Council records treasury receipts'; end if;
  if v_amount<=0 or v_amount>100000000000 or v_amount<>trunc(v_amount) or coalesce(length(v_title),0) not between 1 and 160 then raise exception 'A valid amount and receipt reference are required'; end if;
  perform 1 from public.club_accounts where id='council' for update;
  update public.club_accounts set balance=balance+v_amount::bigint where id='council';
  insert into public.club_ledger(account_id,amount,kind,description,created_by) values('council',v_amount::bigint,'receipt',v_title,v_user);
  return;
 end if;
 if v_action='submit' then
  if not coalesce(public.manages_club(v_club),false) then raise exception 'Only assigned club staff may submit proposals'; end if;
  if v_kind is null or v_kind not in ('funding','expense','event','announcement','activity','membership') then raise exception 'Invalid request type'; end if;
  if coalesce(length(v_title),0) not between 1 and 160 or coalesce(length(v_body),0) not between 1 and 5000 then raise exception 'A title and details are required'; end if;
  if v_kind in ('funding','expense') then
   if v_amount<=0 or v_amount>100000000000 or v_amount<>trunc(v_amount) then raise exception 'Invalid amount'; end if;
  elsif v_amount<>0 then raise exception 'Only financial requests have an amount'; end if;
  if v_kind='event' then
   if coalesce(length(trim(v_details->>'location')),0) not between 1 and 200 or v_details->>'starts_at' is null then raise exception 'An event needs a date and venue'; end if;
   if not isfinite((v_details->>'starts_at')::timestamptz) then raise exception 'Invalid event date'; end if;
  end if;
  if v_kind='membership' then
   v_target := (v_details->>'target')::uuid;
   perform pg_advisory_xact_lock(hashtextextended(v_club||':'||v_target::text,0));
   if v_details->>'decision' is null or v_details->>'decision' not in ('approve','reject') or not exists(select 1 from public.club_memberships where club_id=v_club and user_id=v_target and status='pending') then raise exception 'Membership request is no longer pending'; end if;
  end if;
  insert into public.club_requests(club_id,kind,title,body,amount,status,created_by,creator_name,details,history)
  values(v_club,v_kind,v_title,v_body,v_amount::bigint,case when v_kind='funding' and public.supervises_club(v_club) then 'pending_admin' else 'pending_faculty' end,v_user,v_name,v_details,v_audit);
  return;
 end if;
 select * into v_request from public.club_requests where id=(p_command->>'request_id')::uuid for update;
 if not found then raise exception 'Request not found'; end if;
 if v_action='cancel' then
  if (v_request.created_by<>v_user and v_role<>'Admin') or v_request.status not in ('pending_faculty','pending_admin','approved_funding') then raise exception 'Request cannot be cancelled'; end if;
  v_request.status := 'cancelled';
 elsif v_action='release' then
  if v_role is distinct from 'Student Council' or v_request.status<>'approved_funding' or v_request.kind<>'funding' then raise exception 'Only Student Council can release Admin-authorized funding'; end if;
  perform 1 from public.club_accounts where id in ('council',v_request.club_id) order by id for update;
  select balance into v_balance from public.club_accounts where id='council';
  if v_balance<v_request.amount then raise exception 'Student Council has insufficient treasury funds'; end if;
  update public.club_accounts set balance=balance-v_request.amount where id='council';
  update public.club_accounts set balance=balance+v_request.amount where id=v_request.club_id;
  insert into public.club_ledger(account_id,amount,kind,description,request_id,created_by) values
   ('council',-v_request.amount,'funding_out',v_request.title,v_request.id,v_user),
   (v_request.club_id,v_request.amount,'funding_in',v_request.title,v_request.id,v_user);
  v_request.status := 'completed';
 elsif v_action in ('approve','reject') then
  if not ((v_request.status='pending_faculty' and coalesce(public.supervises_club(v_request.club_id),false)) or (v_request.status='pending_admin' and v_role='Admin')) then raise exception 'Request is not awaiting your approval'; end if;
  if v_action='reject' then
   if v_note='' then raise exception 'A rejection reason is required'; end if;
   v_request.status := 'rejected';
  elsif v_request.kind='funding' then
   v_request.status := case when v_request.status='pending_faculty' then 'pending_admin' else 'approved_funding' end;
  else
   if v_request.kind='expense' then
    select balance into v_balance from public.club_accounts where id=v_request.club_id for update;
    if v_balance<v_request.amount then raise exception 'This club has insufficient funds; request funding first'; end if;
    update public.club_accounts set balance=balance-v_request.amount where id=v_request.club_id;
    insert into public.club_ledger(account_id,amount,kind,description,request_id,created_by) values(v_request.club_id,-v_request.amount,'expense',v_request.title,v_request.id,v_user);
   elsif v_request.kind='event' then
    insert into public.club_events(id,club_id,title,starts_at,location) values(v_request.id::text,v_request.club_id,v_request.title,(v_request.details->>'starts_at')::timestamptz,v_request.details->>'location');
   elsif v_request.kind='announcement' then
    insert into public.club_announcements(id,club_id,title,body) values(v_request.id,v_request.club_id,v_request.title,v_request.body);
   elsif v_request.kind='membership' then
    v_target := (v_request.details->>'target')::uuid;
    perform pg_advisory_xact_lock(hashtextextended(v_request.club_id||':'||v_target::text,0));
    update public.club_memberships set status=case when v_request.details->>'decision'='approve' then 'approved' else 'rejected' end where club_id=v_request.club_id and user_id=v_target and status='pending';
    if not found then raise exception 'Membership request is no longer pending'; end if;
   end if;
   v_request.status := 'completed';
  end if;
 else raise exception 'Unknown workflow action'; end if;
 update public.club_requests set status=v_request.status,history=history||v_audit where id=v_request.id;
end;
$$;
revoke all on function public.supervises_club(text),public.leads_club(text),public.club_governance(jsonb) from public,anon;
grant execute on function public.supervises_club(text),public.leads_club(text),public.club_governance(jsonb) to authenticated;

-- Membership decisions are reserved for faculty or campus Admin.
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
    if not coalesce(public.supervises_club(p_club),false) then raise exception 'Faculty approval is required for membership decisions'; end if;
    if v_status is distinct from 'pending' then raise exception 'Request is no longer pending'; end if;
    update public.club_memberships set status = case when p_action = 'approve' then 'approved' else 'rejected' end where club_id = p_club and user_id = p_user;
  elsif p_action = 'leave' then
    if p_user <> auth.uid() then raise exception 'You can only leave for yourself'; end if;
    delete from public.club_memberships where club_id = p_club and user_id = p_user;
  else raise exception 'Unknown membership action';
  end if;
end;
$$;


create or replace function public.club_assign_staff(p_club text,p_user uuid,p_enabled boolean)
returns void language plpgsql security definer set search_path='' as $$
declare v_role text;
begin
 if public.current_campus_role() is distinct from 'Admin' then raise exception 'Only Admin assigns club staff'; end if;
 select role into v_role from public.profiles where id=p_user;
 if v_role is null or v_role not in ('Faculty','Club Leader') then raise exception 'Choose a Faculty or Club Leader profile'; end if;
 if not exists(select 1 from public.campus_clubs where id=p_club) then raise exception 'Unknown club'; end if;
 delete from public.club_faculty where club_id=p_club and user_id=p_user;
 delete from public.club_admins where club_id=p_club and user_id=p_user;
 if p_enabled and v_role='Faculty' then insert into public.club_faculty values(p_club,p_user); end if;
 if p_enabled and v_role='Club Leader' then insert into public.club_admins values(p_club,p_user); end if;
end $$;
revoke all on function public.club_assign_staff(text,uuid,boolean) from public,anon;
grant execute on function public.club_assign_staff(text,uuid,boolean) to authenticated;
grant update(role) on public.profiles to authenticated;
commit;
-- Assign Faculty via club_faculty and Club Leader via club_admins, using existing profile UUIDs.
