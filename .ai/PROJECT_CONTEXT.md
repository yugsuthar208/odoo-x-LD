# Project Context: Campus Commons

## Purpose

Campus Commons is a role-aware campus organization and student life platform themed for Northstar University. It supports students, club leaders, faculty, student council representatives, and admins across clubs, events, volunteering, tasks, marketplace, campus issues, finance, announcements, and elections.

## Stack

- Next.js 15 App Router, React 19, TypeScript 5 strict mode.
- Custom CSS in `app/globals.css`; GSAP and `@gsap/react` animate the marketing landing page.
- Supabase JavaScript client for browser authentication and direct Postgres access.
- Supabase PostgreSQL schema and row-level security are in `supabase/schema.sql`, `supabase/clubs.sql`, and `supabase/governance.sql`.
- Prisma and a structured-model schema are also present (`lib/prisma.ts`, `prisma/schema.prisma`), but current app components use Supabase/local browser state rather than Prisma.

## Current routes and architecture

- `/` is redirected to `/login` by `next.config.ts`. `app/page.tsx` contains a marketing landing page, but the redirect currently prevents it from serving at `/`.
- `/login` handles Supabase password auth, sign-up, password reset, and local preview entry.
- `/dashboard` is the role-aware workspace. `app/dashboard/page.tsx` owns state, hydration, role capabilities, persistence, and composition of module components.
- `components/modules/` contains workspace feature screens; `components/navigation/` contains sidebar, topbar, and notification UI; `components/modals/ModalProvider.tsx` owns dialogs and modal actions.
- Shared domain and role types live in `lib/supabase/types.ts`; browser Supabase client setup lives in `lib/supabase.ts`.
- No custom API route handlers or server-side service layer are present. Browser components call Supabase directly; database RLS is the authorization boundary. UI visibility checks are not security controls.
- `campus_records` stores legacy JSONB activity payloads. New club memberships, events, announcements, admin assignments, and RSVPs use dedicated tables in `supabase/clubs.sql`.

## Authentication, data, and demo mode

- `.env.example` documents `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; never commit secret keys or environment values.
- Supabase Auth provisions profiles with the default `Student` role; privileged role changes are administrative.
- Preview mode uses `localStorage` and is not an authenticated account. Workspace state is snapshotted per profile/preview role. Authenticated sessions also load/write selected `campus_records`.
- Keep five role values aligned across TypeScript and SQL: `Student`, `Club Leader`, `Faculty`, `Student Council`, and `Admin`.
- `.ai/CHANGELOG.md` records earlier project work but includes stale entries and test claims; treat it as historical context, not evidence that the current checkout was tested.

## Commands and checks

- `npm.cmd run dev` — start the development server.
- `npm.cmd run build` — production build and Next.js type validation.
- `npm.cmd run start` — serve a production build.
- `npx tsc --noEmit` — standalone TypeScript check.
- `test_all_features.py` is a standalone Playwright script expecting a local server on port 3000; Python Playwright is not a package dependency or npm script.

## Known limitations and active checkout state

- README identifies payment settlement, production QR signing/validation, private multi-party messaging, OCR, and independently auditable anonymous ballots as unfinished production work.
- Git history currently has `b85f6f1` (`feat: redirect root to /login`) at `main`, aligned with `origin/main`.
- The working tree already contains user changes in `app/dashboard/page.tsx`, eight modules, `components/navigation/Sidebar.tsx`, and `lib/supabase/types.ts`. Inspect and preserve these edits before any follow-up implementation.
- No CI or deployment configuration is checked in; deployment steps are in `README.md`.

## AI workflow

Before coding, read this file, `.ai/CODEBASE_MAP.md`, and `.ai/ARCHITECTURE.md`; inspect only relevant files and preserve any pre-existing user changes. After a task, synchronize these documents with code and add a concise entry to `.ai/CHANGELOG.md`.

## Multi-club membership (2026-10-03)

- `lib/clubs.ts` defines ten public clubs and preview content; `lib/useClubWorkspace.ts` owns membership data and persistence; `components/modules/ClubsModule.tsx` renders the directory, My Clubs, and private club pages.
- Club pages are linkable at `/dashboard?club=ieee` (and the other club IDs). Membership states are pending, approved, and rejected. Leaving deletes membership and associated RSVPs.
- Auto-accept is a top-bar switch available only in local preview. It approves pending requests as well as future requests and is stored in `campus-commons-clubs-v1` with preview club data.
- Preview roles share the club test data. Club Leader proposes operations for IEEE, Coding, Robotics, and Design Society; Faculty supervises those same preview clubs; Admin manages all clubs. In authenticated mode, `club_admins` assigns leaders, `club_faculty` assigns faculty supervisors, and campus Admin manages all clubs.
- Apply `supabase/clubs.sql` after `supabase/schema.sql`. Legacy membership records do not grant new club access. The hosted connection currently rejects the configured database credentials with `tenant/user not found`; migration was applied and tested only in an isolated local PostgreSQL instance.
- `tests/test_clubs.py` covers browser workflows; `tests/clubs_permissions.sql` covers RLS and mutation permissions. `tests/clubs_bootstrap.sql` is only for disposable local PostgreSQL, never hosted Supabase.


## Faculty authority and club finance (2026-10-03)

- `lib/governance.ts` defines request states, exact paise accounting, permissions, and preview transitions. `GovernanceModule` is the shared approval/finance interface; `FinanceModule` wraps its finance mode.
- Leaders propose operations for assigned clubs. Faculty supervises assigned clubs and reviews proposals; Admin can override faculty review. Funding proceeds from faculty review to Admin authorization to Student Council release. Only Council records treasury receipts or releases funds.
- `supabase/governance.sql` adds faculty assignments, per-club/Council accounts, approval requests/history, an immutable ledger, RLS, and transaction-locked workflow functions. It also closes legacy activity-table bypasses and reserves direct membership decisions for faculty/Admin.
- Admin assigns staff in Finance's club-specific view. `club_admins` holds leader assignments and `club_faculty` holds faculty assignments; current profile roles are checked at use time.
- Finance replaces the old shared demo balance/entry form. Club Dashboard and leader/faculty operational screens use the approval interface. My Clubs and member pages show approved content only.
- Preview defaults to ₹2,50,000 in the Council treasury and zero club balances; real accounts start at zero. The membership auto-accept toggle never bypasses financial or operational review. Explicit preview mode bypasses hosted auth initialization.
- `tests/test_governance.py` and `tests/governance_permissions.sql` cover this hierarchy alongside the updated membership regression tests. The hosted migration remains blocked by the previously observed invalid database tenant/user configuration.
