-- Run this once in Supabase Dashboard → SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'Student'
    check (role in ('Student', 'Club Leader', 'Faculty', 'Student Council', 'Admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

create or replace function public.create_campus_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'Student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_campus_profile on auth.users;
create trigger on_auth_user_created_campus_profile
  after insert on auth.users
  for each row execute procedure public.create_campus_profile();

create or replace function public.current_campus_role()
returns text language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles" on public.profiles
  for all to authenticated
  using (public.current_campus_role() = 'Admin')
  with check (public.current_campus_role() = 'Admin');

create table if not exists public.campus_records (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in (
    'event', 'task', 'listing', 'issue', 'issue_support', 'chat_message',
    'volunteer_application', 'ticket', 'checkin', 'vote', 'membership', 'announcement', 'finance_entry'
  )),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campus_records_kind_created_at_idx on public.campus_records (kind, created_at desc);
alter table public.campus_records enable row level security;

drop policy if exists "Campus members can read campus records" on public.campus_records;
create policy "Campus members can read campus records" on public.campus_records
  for select to authenticated using (true);

drop policy if exists "Members can create permitted records" on public.campus_records;
create policy "Members can create permitted records" on public.campus_records
  for insert to authenticated with check (
    created_by = (select auth.uid()) and
    case kind
      when 'event' then public.current_campus_role() in ('Club Leader', 'Faculty', 'Student Council', 'Admin')
      when 'task' then public.current_campus_role() in ('Club Leader', 'Faculty', 'Student Council', 'Admin')
      when 'listing' then public.current_campus_role() in ('Student', 'Club Leader', 'Student Council', 'Admin')
      when 'finance_entry' then public.current_campus_role() in ('Club Leader', 'Faculty', 'Student Council', 'Admin')
      when 'announcement' then public.current_campus_role() in ('Club Leader', 'Faculty', 'Student Council', 'Admin')
      else true
    end
  );

drop policy if exists "Owners and campus officers can update records" on public.campus_records;
create policy "Owners and campus officers can update records" on public.campus_records
  for update to authenticated using (
    created_by = (select auth.uid()) or public.current_campus_role() in ('Faculty', 'Student Council', 'Admin')
  ) with check (
    created_by = (select auth.uid()) or public.current_campus_role() in ('Faculty', 'Student Council', 'Admin')
  );

drop policy if exists "Owners and campus officers can delete records" on public.campus_records;
create policy "Owners and campus officers can delete records" on public.campus_records
  for delete to authenticated using (
    created_by = (select auth.uid()) or public.current_campus_role() in ('Faculty', 'Student Council', 'Admin')
  );

grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.campus_records to authenticated;

-- Assign a privileged role only after that person has signed up:
-- update public.profiles set role = 'Club Leader' where id = (select id from auth.users where email = 'leader@northstar.edu');
