-- Run against an isolated database after clubs_bootstrap.sql, schema.sql, clubs.sql.
-- Test rows and helper functions are rolled back.
begin;
create function pg_temp.assert_true(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %', message; end if; end $$;
create function pg_temp.denied(statement text) returns void language plpgsql as $$
declare blocked boolean := false;
begin
  begin execute statement; exception when others then blocked := true; end;
  if not blocked then raise exception 'FAIL: allowed forbidden operation: %', statement; end if;
end $$;
insert into auth.users(id,raw_user_meta_data) values
 ('00000000-0000-0000-0000-000000000001','{"full_name":"Student One"}'),
 ('00000000-0000-0000-0000-000000000002','{"full_name":"Student Two"}'),
 ('00000000-0000-0000-0000-000000000003','{"full_name":"IEEE Admin"}'),
 ('00000000-0000-0000-0000-000000000004','{"full_name":"Campus Admin"}');
update public.profiles set role='Faculty' where id='00000000-0000-0000-0000-000000000003';
update public.profiles set role='Admin' where id='00000000-0000-0000-0000-000000000004';
insert into public.club_faculty values ('ieee','00000000-0000-0000-0000-000000000003');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select pg_temp.assert_true((select count(*)=10 from public.campus_clubs),'10 public clubs');
select pg_temp.assert_true((select count(*)=0 from public.club_events),'nonmember events hidden');
select pg_temp.assert_true((select count(*)=0 from public.club_announcements),'nonmember announcements hidden');
select public.club_membership_action('ieee','request',auth.uid());
select public.club_membership_action('ieee','request',auth.uid());
select pg_temp.assert_true((select count(*)=1 from public.club_memberships where status='pending'),'duplicate join is idempotent');
select pg_temp.assert_true((select count(*)=0 from public.club_events),'pending events hidden');
select pg_temp.denied($q$select public.club_membership_action('ieee','approve',auth.uid())$q$);
select pg_temp.denied($q$update public.club_memberships set status='approved'$q$);
select pg_temp.denied($q$select public.club_rsvp('ieee-welcome',true)$q$);
select pg_temp.denied($q$select public.club_membership_action('ieee','request','00000000-0000-0000-0000-000000000002')$q$);
select pg_temp.denied($q$insert into public.club_announcements(club_id,title,body) values('ieee','Unauthorized','Not allowed')$q$);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
select public.club_membership_action('coding','request',auth.uid());
select pg_temp.assert_true((select count(*)=1 from public.club_memberships),'student cannot see other pending requests');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
select pg_temp.assert_true((select count(*)=1 from public.club_memberships),'club admin sees own club requests');
select pg_temp.denied($q$select public.club_membership_action('coding','approve','00000000-0000-0000-0000-000000000002')$q$);
select public.club_membership_action('ieee','reject','00000000-0000-0000-0000-000000000001');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select pg_temp.assert_true((select status='rejected' from public.club_memberships where club_id='ieee'),'rejection visible');
select public.club_membership_action('ieee','request',auth.uid());
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
select public.club_membership_action('ieee','approve','00000000-0000-0000-0000-000000000001');
select public.club_governance('{"action":"submit","club_id":"ieee","kind":"announcement","title":"Team update","body":"Approved members can read this."}');
select public.club_governance(jsonb_build_object('action','approve','request_id',id)) from public.club_requests where title='Team update';
select pg_temp.denied($q$insert into public.club_announcements(club_id,title,body) values('coding','Wrong club','Not allowed')$q$);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select pg_temp.assert_true((select count(*)=1 from public.club_events),'member sees own events only');
select pg_temp.assert_true((select count(*)=1 from public.club_announcements where title='Team update'),'member reads new announcement');
select pg_temp.assert_true((select count(*)=1 from public.club_memberships where status='approved'),'member directory');
select public.club_rsvp('ieee-welcome',true);
select public.club_rsvp('ieee-welcome',true);
select pg_temp.assert_true((select count(*)=1 from public.club_rsvps),'RSVP idempotent');
select pg_temp.denied($q$select public.club_rsvp('coding-welcome',true)$q$);
select public.club_rsvp('ieee-welcome',false);
select pg_temp.assert_true((select count(*)=0 from public.club_rsvps),'RSVP cancellation');
select public.club_rsvp('ieee-welcome',true);
select public.club_membership_action('ieee','leave',auth.uid());
select pg_temp.assert_true((select count(*)=0 from public.club_events),'leave revokes access');
select pg_temp.assert_true((select count(*)=0 from public.club_announcements),'leave revokes announcements');
select public.club_membership_action('ieee','request',auth.uid());
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',true);
select public.club_membership_action('ieee','approve','00000000-0000-0000-0000-000000000001');
select public.club_membership_action('coding','approve','00000000-0000-0000-0000-000000000002');
select pg_temp.assert_true((select count(*)=0 from public.club_rsvps),'leaving deletes RSVP');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select pg_temp.assert_true((select count(*)=1 from public.club_events),'campus admin approved rejoin');
select pg_temp.assert_true((select count(*)=0 from public.club_rsvps),'rejoin does not restore RSVP');
set local role anon;
select pg_temp.denied($q$select public.club_membership_action('ieee','request','00000000-0000-0000-0000-000000000001')$q$);
select pg_temp.denied($q$select * from public.club_events$q$);
rollback;
select 'PASS: membership transitions, RLS, admin scope, private content, RSVP, leave cleanup, and anonymous denial' as result;
