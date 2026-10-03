# Architecture

## Routes and application shape

```text
Browser
  ├─ /       → next.config.ts redirect to /login
  ├─ /login  → Supabase Auth (when configured) or local preview entry
  └─ /dashboard → app/dashboard/page.tsx
                    ├─ navigation and modal components
                    ├─ feature modules
                    ├─ localStorage preview/profile snapshots
                    └─ lib/supabase.ts → Supabase Auth / Postgres REST
```

`app/page.tsx` still contains a GSAP marketing landing page, but the `next.config.ts` redirect currently means `/` does not render that page. `/dashboard` is the active workspace route. There is no application API route or server-side business logic layer.

## Authentication and roles

1. `lib/supabase.ts` initializes the browser client when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured.
2. `app/login/page.tsx` implements password sign-in, sign-up, reset, and preview mode.
3. `app/dashboard/page.tsx` resolves the authenticated profile or preview role and selects the workspace state key.
4. The five role values are `Student`, `Club Leader`, `Faculty`, `Student Council`, and `Admin`; `components/navigation/Sidebar.tsx` describes visible navigation by role.
5. `supabase/schema.sql` provisions a default Student profile and restricts record operations through Postgres RLS. Frontend role checks only shape the interface.

## State and persistence

- Workspace fixtures, state, hydration, activity writes, and handler logic are centralized in `app/dashboard/page.tsx`.
- Local preview and workspace snapshots use browser `localStorage` with profile/role-scoped keys.
- Authenticated hydration loads `profiles` and `campus_records`; selected interactions write tagged JSONB activity payloads to `campus_records`.
- Not every fixture or screen is cloud-backed. Many metrics and workflows remain local/demo behavior; see `README.md` for known production gaps.

## Database and integrations

- Active persistence/auth integration: Supabase browser client + PostgreSQL schema/RLS (`supabase/schema.sql`).
- The `profiles` table associates user IDs with names and roles; `campus_records` stores kind-tagged JSONB data.
- `prisma/schema.prisma` and `lib/prisma.ts` define an additional structured schema/client but are not used by the current workspace request flow. Avoid treating these models as the live source of data without an explicit migration/integration task.
- `app/page.tsx` uses GSAP and ScrollTrigger for the marketing page animations.
- Global design and responsive rules are in `app/globals.css`; no other external app service is declared.

## Constraints

- Supabase anon key is public client configuration; never expose a service-role key.
- RLS is the persisted-data security boundary. Hiding a control in React does not secure the data.
- Shared state and most orchestration remain concentrated in one client component.
- The current root redirect makes the landing page unreachable at `/` until route behavior is intentionally changed.
- Git working tree may include user changes. Inspect `git status` and relevant diffs before editing; do not overwrite unrelated edits.

## Club membership boundary

`app/dashboard/page.tsx` mounts `useClubWorkspace` after authentication resolves. `ClubsModule` receives its state and actions. Selecting a club writes `/dashboard?club=<id>` into browser history, so reloads and direct links reopen the same club. My Clubs and the older Membership option use approved membership data, also passed to overview and achievements.

Preview uses a separate shared browser store, `campus-commons-clubs-v1`, so the student and admin test roles see the same requests. Auto-accept is preview-only and converts all pending memberships to approved when enabled. There is no authenticated auto-approval switch or RPC.

Authenticated clients read club memberships, events, announcements, RSVPs, and their admin assignments from dedicated Supabase tables. RLS hides private club content until approval or club administration. The `club_membership_action` and `club_rsvp` functions validate identity and permissions and serialize changes for each club/user pair. Clients cannot write membership status directly. Removing a membership cascades to its RSVPs. Announcement publication goes through faculty/Admin approval in club_governance; direct client inserts are revoked by governance.sql.

Refresh happens after each mutation, on browser focus/storage changes, or through the Refresh club control. Cloud failures are shown explicitly, without silently falling back to preview membership data. Club preview data and real account data never share persistence.


## Faculty authority and club finance (2026-10-03)

- `lib/governance.ts` defines request states, exact paise accounting, permissions, and preview transitions. `GovernanceModule` is the shared approval/finance interface; `FinanceModule` wraps its finance mode.
- Leaders propose operations for assigned clubs. Faculty supervises assigned clubs and reviews proposals; Admin can override faculty review. Funding proceeds from faculty review to Admin authorization to Student Council release. Only Council records treasury receipts or releases funds.
- `supabase/governance.sql` adds faculty assignments, per-club/Council accounts, approval requests/history, an immutable ledger, RLS, and transaction-locked workflow functions. It also closes legacy activity-table bypasses and reserves direct membership decisions for faculty/Admin.
- Admin assigns staff in Finance's club-specific view. `club_admins` holds leader assignments and `club_faculty` holds faculty assignments; current profile roles are checked at use time.
- Finance replaces the old shared demo balance/entry form. Club Dashboard and leader/faculty operational screens use the approval interface. My Clubs and member pages show approved content only.
- Preview defaults to ₹2,50,000 in the Council treasury and zero club balances; real accounts start at zero. The membership auto-accept toggle never bypasses financial or operational review. Explicit preview mode bypasses hosted auth initialization.
- `tests/test_governance.py` and `tests/governance_permissions.sql` cover this hierarchy alongside the updated membership regression tests. The hosted migration remains blocked by the previously observed invalid database tenant/user configuration.
