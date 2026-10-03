# Project Context: Campus Commons

## Project Purpose
Campus Commons is a role-aware campus organization and student life platform for higher education communities (themed for Northstar University). It provides a unified workspace for students, club leaders, faculty advisors, student council representatives, and administrators to discover clubs, manage events, volunteer, coordinate tasks, post marketplace items, raise campus issues, view financial ledgers, participate in elections, and manage member roles.

The application operates in two distinct execution modes:
1. **Supabase Live Mode**: Authenticated multi-user workspace backed by Supabase Auth and PostgreSQL with Row-Level Security (RLS).
2. **Local Preview Mode**: Zero-backend browser-only interactive demo using `localStorage` for role and state switching.

---

## Technology Stack
- **Framework**: Next.js 15.5.27 (App Router)
- **UI Library**: React 19.0.0 / React DOM 19.0.0
- **Language**: TypeScript 5.x (Strict mode, ES2017 target)
- **Backend-as-a-Service / Database**: Supabase (`@supabase/supabase-js` v2.117.2), PostgreSQL with `pgcrypto` & RLS
- **Styling**: Pure custom CSS (`app/globals.css`) with CSS custom properties, Google Fonts (`DM Sans`, `DM Mono`, `Fraunces`, `Patrick Hand`), CSS Grid/Flexbox, and responsive media queries (no Tailwind/CSS-in-JS).
- **Node Target**: Node.js 20+

---

## Major Features & Modules (18 Sections)
- **Overview**: Role-tailored dashboard with contextual greeting, key metrics, upcoming events preview, and activity feed.
- **College Portal**: Central campus hub featuring official college news, campus handbook/contacts, student partner offers, and club directory.
- **Discover Clubs**: Filterable club catalog by category (`CREATIVE`, `TECHNOLOGY`, `COMMUNITY`, `CULTURE`), search, and club joining.
- **Events & Ticketing**: Event calendar, RSVP / ticket issuance, inline event creation (for privileged roles), and QR check-in demo.
- **Membership**: Club membership status tracking (`ACTIVE`, `RENEW SOON`, `PENDING`), dues renewal, and member benefits.
- **Volunteers**: Opportunity listings, hours/points tracking, badge progression, and volunteer application commitments.
- **Tasks**: Shared team task checklist with status toggles, progress tracking, and inline task creation.
- **Club Dashboard**: Dedicated leader workspace with customizable club page engine (themes like Forest / Sunset) and operational shortcuts.
- **Club Shop**: Official club-managed merchandise store with live stock counts and ordering (separate from student marketplace).
- **Marketplace**: Student-to-student buy-and-sell reuse marketplace with pricing and seller inquiry.
- **Messages**: Campus announcement channels and conversation interface.
- **Help Desk / Issues**: Issue submission, topic categorization, status tracking, and community upvoting.
- **Finance**: Organization budget breakdown, income/spending metrics, and recent transaction ledger.
- **Announcements**: Official campus announcement board and announcement publisher studio with audience targeting.
- **Achievements**: Gamified student profile with volunteer points, hours given, badging system, and volunteer/marketplace leaderboards.
- **Council**: Student council announcements, open student initiative support, and election preview.
- **Elections**: Candidate profiles, manifestos, and position-based voting.
- **Administration**: Admin-only member directory and role management selector.

---

## Roles & Access Control
Five distinct campus roles are defined in `CampusRole` (`lib/supabase.ts` and `supabase/schema.sql`):
1. **Student**: Overview, College portal, Discover clubs, Events, Membership, Volunteers, Marketplace, Club shop, Messages, Help desk, Announcements, Achievements, Elections.
2. **Club Leader**: Student capabilities + Tasks, Club dashboard, Finance, announcement publishing studio.
3. **Faculty**: Overview, College portal, Discover clubs, Events, Volunteers, Tasks, Club dashboard, Finance, Help desk, Announcements.
4. **Student Council**: Campus governance, issue moderation, budgets, elections, announcements, task board, all student areas.
5. **Admin**: Full system access, all 18 campus modules, and the Administration member/role management directory.

---

## Important Commands
- **Install dependencies**: `npm install` (or `npm.cmd install` on Windows)
- **Start development server**: `npm run dev` (Runs on `http://localhost:3000`)
- **Build production bundle**: `npm run build`
- **Start production server**: `npm run start`

---

## Database & ORM
- **Database Engine**: PostgreSQL managed via Supabase.
- **Schema Location**: `supabase/schema.sql` (applied manually in Supabase SQL Editor).
- **Tables**:
  - `public.profiles`: Stores user IDs (linked to `auth.users`), `full_name`, and assigned `role`.
  - `public.campus_records`: Generic activity record store with `kind` discriminator, `payload` JSONB data, `created_by` UUID, and timestamps.
- **Access Pattern**: Direct client-side queries via `@supabase/supabase-js` client; data security enforced at the database level using Row-Level Security (RLS) policies and PostgreSQL helper functions (`current_campus_role()`).

---

## External Services & Integrations
- **Supabase**:
  - Supabase Auth (Email + Password sign-in, sign-up, password reset).
  - Supabase PostgreSQL Database (REST API access via PostgREST).
- **Google Fonts**: Web fonts imported via CDN in `app/globals.css`.

---

## Authentication Flow
- Handled in `app/login/page.tsx` via Supabase client:
  - Sign in: `supabase.auth.signInWithPassword({ email, password })`
  - Sign up: `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
  - Password reset: `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
- Automatic user profile creation: A PostgreSQL trigger (`on_auth_user_created_campus_profile`) automatically creates a `profiles` record with default role `Student` upon user registration.
- Fallback preview mode: If environment variables are missing or preview is selected, stores `campus-commons-preview-role` in `localStorage`.

---

## Important Environment Variables
Configured in `.env.local` (reference: `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`: URL of the Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous public API key.

*Note: Never place service-role keys or secrets in `NEXT_PUBLIC_*` variables.*

---

## Important Conventions & Code Rules
- **Direct Client Architecture**: Next.js App Router is used with client components (`"use client"`). All data fetching and mutations happen client-side.
- **Dual Persistence**: Data mutations update React state, local storage (`campus-commons-demo-v1:*`), and insert records to Supabase `campus_records` if connected.
- **CSS Architecture**: Styling is centralized in `app/globals.css` using custom semantic classes, variables, and media queries. Avoid introducing arbitrary utility classes or external CSS frameworks unless requested.
- **Role Guarding**: Feature capabilities (`canCreateEvents`, `canManageTasks`, `canListMarketplace`, `canModerateIssues`, `canAdminister`, `canPublish`) and visible navigation items are derived from the active `role` state.

---

## Key Constraints & Warnings
- **Database Polymorphism**: `campus_records` stores varied entities (`event`, `task`, `listing`, `issue`, `chat_message`, `ticket`, `checkin`, `vote`, `membership`, `announcement`, `finance_entry`) as JSONB payloads rather than individual relational tables.
- **No API Routes**: There are currently no Next.js Route Handlers (`app/api/*`).
- **No Realtime Subscriptions**: Updates are fetched on initial hydration; live multi-client synchronization currently requires a refresh or manual hydration.
- **Demo Boundaries**: Financial calculations, ticket QR code scanning, multi-party messaging, and secret ballot voting contain client-side simulations and placeholder integrations.

---

## Current Project State
- Full interactive frontend implemented in `app/page.tsx` (Core modules + SRS frontend extension `SrsFrontendPages`) and `app/login/page.tsx`.
- Complete Supabase schema and RLS policies defined in `supabase/schema.sql`.
- Ready for local development and Vercel deployment.

---

## AI WORKFLOW

Before starting a coding task:

1. Read `.ai/PROJECT_CONTEXT.md`
2. Read `.ai/CODEBASE_MAP.md`
3. Read `.ai/ARCHITECTURE.md`
4. Use those files to identify the relevant parts of the codebase.
5. Inspect only the files necessary for the requested task.
6. Do not rescan the entire repository unless the task genuinely requires it.

After completing a coding task:

1. Update `.ai/PROJECT_CONTEXT.md` if project-level information changed.
2. Update `.ai/CODEBASE_MAP.md` if files, modules, or structure changed.
3. Update `.ai/ARCHITECTURE.md` if architecture or data flow changed.
4. Add a concise entry to `.ai/CHANGELOG.md`.
5. Keep all `.ai/` documentation synchronized with the actual code.
