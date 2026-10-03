# Campus Commons

Campus Commons is a role-aware campus organizations app built with Next.js and Supabase Auth. Students, club leaders, faculty, council members and admins get different navigation and permissions. Event proposals, tasks, marketplace listings, issues, group messages, memberships, volunteer applications, tickets, check-ins and votes can be stored in the shared Supabase workspace. A browser-only preview is available before connecting a Supabase project.

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon key from Supabase → Project Settings → API.
3. Run `supabase/schema.sql` once in Supabase → SQL Editor.
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

Supabase provides real authentication, protected campus roles, and shared campus activity records. Several overview metrics, club profiles, event metadata, and finance dashboard figures remain seeded demo content; payment settlement, production QR signing and offline validation, private multi-party chat, receipt OCR, and a ballot system with independent anonymity/audit guarantees need further backend work before a real campus launch.
