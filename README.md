# Campus Commons

Campus Commons is a role-aware campus organizations app built with Next.js and Supabase Auth. Students, club leaders, faculty, council members and admins get different navigation and permissions. Event proposals, tasks, marketplace listings, issues, group messages, memberships, volunteer applications, tickets, check-ins and votes can be stored in the shared Supabase workspace. A browser-only preview is available before connecting a Supabase project.

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon key from Supabase → Project Settings → API.
3. Run `supabase/schema.sql`, then `supabase/clubs.sql` and `supabase/governance.sql`, in Supabase → SQL Editor.
4. In Supabase Auth settings, set the site URL to `http://localhost:3000` and allow the local `/login` redirect.
5. Run:

   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000), create an account, then confirm the email if Supabase email confirmation is enabled.

Without Supabase credentials, `/login` still offers a local preview. Preview roles and content are not accounts and stay in that browser.

## Role access

New accounts receive the `Student` role. Users cannot promote themselves. After the user has registered, assign access from the Supabase SQL Editor:

```sql
update public.profiles
set role = 'Club Leader'
where id = (select id from auth.users where email = 'leader@northstar.edu');
```

Allowed roles: `Student`, `Club Leader`, `Faculty`, `Student Council`, `Admin`. Database row-level security limits which campus record types each role can create. Do not put a Supabase service-role key in a `NEXT_PUBLIC_*` variable or in this repository.

The feature boundary is intentional:

| Role | Workspace access |
| --- | --- |
| Student | Discover clubs, RSVP and check in, volunteer, marketplace, messages, help desk and elections |
| Club Leader | Student features plus event creation, team tasks and club finance |
| Faculty | Club and event oversight, approvals, tasks, finance and issue follow-up |
| Student Council | Governance, issue management, budgets, elections, announcements and campus operations |
| Admin | All campus areas plus the Administration role directory |

## Deploy on Vercel

Push this project to GitHub, import the repository in Vercel, and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project environment. Add the production domain to Supabase Auth’s Site URL and Redirect URLs, then deploy. The included repository screenshot points to `yugsuthar208/odoo-x-LD`; this workspace has not been pushed to it.

## Current scope

### Clubs and student membership

Discover clubs includes IEEE, Singing, Dancing, Photography, Robotics, Drama, Debate, Coding, Design Society, and Green Collective. Each has a linkable page such as `/dashboard?club=ieee`.

- Students request membership. Pending and rejected applicants see public descriptions; approved members get club events, RSVP/cancellation, announcements, and the member list.
- My Clubs lists approved memberships and separately shows pending requests. The older Membership navigation now opens this same membership view.
- Assigned Faculty approve or reject join requests; Club Leaders recommend decisions for faculty review. Announcements and events publish only after an approved proposal. Campus Admins manage every club. Assign an existing user to a club from the Supabase SQL Editor:

  ```sql
  insert into public.club_admins (club_id, user_id)
  values ('ieee', 'EXISTING_PROFILE_UUID')
  on conflict do nothing;
  ```

- Leaving removes membership and the student's RSVPs. Applying again starts a new pending request.
- Use Refresh club or refocus the browser to retrieve another user's changes.
- The top-bar **TEST MODE · AUTO-ACCEPT** switch is available only in local preview. Turning it on approves every pending preview request; future requests are approved immediately. Turning it off restores manual review. It never changes authenticated memberships.
- To test manual review in preview: apply as Student, switch to Faculty (assigned IEEE, Coding, Robotics, and Design Society) or Admin (all clubs), open the club, and approve/reject. Switch back to Student to see the result. Preview data is shared between roles in that browser and persisted separately from signed-in data.

Club membership uses dedicated tables and database functions in `supabase/clubs.sql`, with row-level security for private content. Existing legacy JSONB membership activities do not grant club access. If the new migration is missing, the app displays a setup error rather than pretending a cloud write succeeded.

### Club checks

- `npm run build` checks the production build and TypeScript.
- Start the app, install Python Playwright and its Chromium browser, then run `python tests/test_clubs.py`. The default test URL is `http://localhost:3001`; override with `BASE_URL`. `CHROME_PATH` optionally selects an existing Chromium binary.
- For database permission tests, use a fresh, disposable PostgreSQL database: apply `tests/clubs_bootstrap.sql`, `supabase/schema.sql`, `supabase/clubs.sql`, `supabase/governance.sql`, then `tests/clubs_permissions.sql` and `tests/governance_permissions.sql` with `psql -v ON_ERROR_STOP=1`. The bootstrap emulates Supabase Auth for local tests only; never run it on a hosted project. The permission test rolls its test data back.

Implementation checks passed locally on 2026-10-03: browser workflows for all ten clubs, PostgreSQL permission tests, and production build. Applying the migration to the configured hosted project remains blocked by its database connection error: `tenant/user not found`.

Supabase provides real authentication, protected campus roles, and shared campus activity records. Several overview metrics, club profiles, event metadata, and finance dashboard figures remain seeded demo content; payment settlement, production QR signing and offline validation, private multi-party chat, receipt OCR, and a ballot system with independent anonymity/audit guarantees need further backend work before a real campus launch.


## Authority, club expenses, and funding

- **Admin** is the highest authority: assigns club leaders/faculty, reviews funding, can review any club proposal, and can cancel an unreleased request.
- **Faculty** supervises assigned clubs. Club Leader proposals for spending, events, announcements, activities/tasks/volunteer drives, and membership decisions require faculty review.
- **Club Leader** can submit proposals only for assigned clubs and track their history. Leaders cannot approve their own requests or edit balances.
- **Student Council** holds the central treasury. It records treasury receipts and releases only Admin-authorized funding. It cannot approve its own funding releases.

Funding submitted by a leader follows **Faculty review → Admin authorization → Student Council release**. Faculty funding requests start at Admin review. Faculty approval of an expense debits only that club's funded balance. Admin can perform faculty reviews as an override, but funding still requires a separate authorization step and Council release.

Finance offers one account and ledger for each of the ten clubs, plus a Council treasury. Each transfer writes a Council debit and club credit in the same transaction. All amounts are stored in integer paise. Insufficient funds, duplicate releases, duplicate receipt references, and unauthorized actions are rejected without partial writes. Rejection requires a reason. Request history records actors, roles, actions, notes, and timestamps. Approved club activities and published events/announcements appear on the club page for members.

Admin assigns staff from **Finance → select a club → Club authority assignments**. Signed-in profiles must first have the Faculty or Club Leader role. The database reads and enforces both role and assignment. Removing an assignment revokes club scope.

The preview starts with an explicitly seeded ₹2,50,000 Council treasury and zero club balances. The production migration starts every account at zero; Student Council records actual receipts before releasing funds. These are accounting records; there is no bank/payment integration. Membership test auto-accept never approves operational or funding requests.

`tests/test_governance.py` covers the full role sequence, club expense isolation, insufficient funds, rejections, cancellation, approved content, assignments, history, persistence, and mobile layout. Use the same Playwright environment as `tests/test_clubs.py`.

The required migration order is `schema.sql` → `clubs.sql` → `governance.sql`. Hosted deployment remains dependent on fixing the existing `tenant/user not found` database connection; the migrations and permission tests run locally in a disposable PostgreSQL instance.
