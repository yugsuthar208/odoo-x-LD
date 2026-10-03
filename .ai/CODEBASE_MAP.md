# Codebase Map

## Routes and important paths

| Path | Responsibility |
| --- | --- |
| `next.config.ts` | Redirects `/` to `/login` (current behavior). |
| `app/page.tsx` | Marketing landing page markup and GSAP/ScrollTrigger animations; currently shadowed by the root redirect. |
| `app/layout.tsx` | Root HTML layout, metadata, and global stylesheet import. |
| `app/login/page.tsx` | Sign in, sign up, password reset, and local preview entry. |
| `app/dashboard/page.tsx` | Workspace state, Supabase/local hydration, role capabilities, persistence, and module composition. |
| `app/globals.css` | Shared design tokens and styling for routes and modules. |
| `components/modules/` | Workspace feature screens, including the club directory and detail view. |
| `components/navigation/` | Sidebar, topbar, and notification popover. |
| `components/modals/ModalProvider.tsx` | Shared modal rendering and modal handlers. |
| `components/ui/` | Shared `Icon` and `ModulePage` primitives. |
| `lib/supabase.ts` | Browser Supabase client factory and `CampusRole`. |
| `lib/supabase/types.ts` | Shared role, section, domain, and modal types. |
| `supabase/schema.sql` | Active Supabase profiles, campus records, helper functions, grants, indexes, and RLS. |
| `lib/prisma.ts`, `prisma/schema.prisma` | Prisma client and a parallel structured schema; not currently used by the workspace flow. |
| `.ai/` | Project context, map, architecture notes, and historical changelog. |

## Workspace modules

`components/modules/` contains `OverviewModule`, `DiscoverClubsModule`, `EventsModule`, `VolunteersModule`, `TasksModule`, `MarketplaceModule`, `MessagesModule`, `HelpDeskModule`, `FinanceModule`, `CouncilModule`, `ElectionsModule`, `AdministrationModule`, `CollegePortalModule`, `MembershipModule`, `AnnouncementsModule`, `ClubShopModule`, `AchievementsModule`, and `ClubDashboardModule`.

## Data flow

- Shared workspace orchestration currently lives in `app/dashboard/page.tsx`; feature handlers and data are passed into module components as props.
- Preview role and profile-scoped workspace snapshots are stored in browser `localStorage`.
- Authenticated sessions read `profiles` and selected `campus_records` and send supported activity writes from the browser Supabase client.
- There are no `app/api` routes, server-side service layer, or active Prisma queries.

## Configuration and checks

- `.env.example`: public Supabase URL and anon key names/placeholders.
- `package.json`: `dev`, `build`, `start`; no configured test script.
- `test_all_features.py`: standalone Playwright flow runner; requires a separately started server and Python Playwright.
- `README.md`: setup, roles, deployment, and product limitations.

## Club membership files

| Path | Responsibility |
| --- | --- |
| `components/modules/ClubsModule.tsx` | Discover clubs, My Clubs, linkable club pages, requests, reviews, RSVP, announcements, and member directory. Replaces the old DiscoverClubsModule and MembershipModule in dashboard composition. |
| `lib/clubs.ts` | Ten-club catalog, club data types, and preview fixtures. |
| `lib/useClubWorkspace.ts` | Preview store and authenticated Supabase adapter; membership, RSVP, publishing, refresh, and test toggle. |
| `supabase/clubs.sql` | Dedicated club tables, RLS, request/review/leave and RSVP functions, seed content. |
| `tests/test_clubs.py` | Playwright tests of all ten clubs and student/admin workflows. |
| `tests/clubs_permissions.sql` | Database transition and permission checks. |
| `tests/clubs_bootstrap.sql` | Minimal Supabase Auth emulation for an isolated local test database. |


## Governance additions

- `lib/governance.ts`: role/scope helpers, request types, audit history, integer-paise preview transitions.
- `components/modules/GovernanceModule.tsx`: approvals, request forms, club accounts, Council receipts/releases, Admin staff assignments, ledger and history.
- `components/modules/FinanceModule.tsx`: finance entry point using GovernanceModule.
- `supabase/governance.sql`: faculty assignments, requests, accounts, ledger, RLS and atomic workflow RPCs. Apply after clubs.sql.
- `tests/test_governance.py`, `tests/governance_permissions.sql`: browser and database checks for role hierarchy and financial transitions.
