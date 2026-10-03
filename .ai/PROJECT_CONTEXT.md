# Project Context: Campus Commons

## Purpose

Campus Commons is a role-aware campus organization and student life platform themed for Northstar University. Students, club leaders, faculty, student council representatives, and admins use it to explore clubs, events, volunteering, tasks, marketplace listings, campus issues, finance, announcements, and elections.

## Stack

- Next.js 15 App Router, React 19, TypeScript 5 in strict mode.
- Custom CSS in `app/globals.css`; Google Fonts are loaded from that stylesheet.
- Supabase JavaScript client (`@supabase/supabase-js`) for browser auth and direct database access.
- Supabase PostgreSQL with row-level security (RLS), defined in `supabase/schema.sql`.
- Node.js 20+ is recommended by `README.md`.

## Architecture and conventions

- `app/page.tsx` owns workspace state, hydration, role capabilities, and composition of module components from `components/modules/`.
- `components/navigation/` contains sidebar/topbar/notification UI; `components/modals/ModalProvider.tsx` owns modal rendering and handlers; `components/ui/` contains shared primitives.
- Keep shared data shapes and role types in `lib/supabase/types.ts`; Supabase client initialization is in `lib/supabase.ts`.
- There is no application API route or ORM. Client components call Supabase directly; RLS is the database authorization boundary. Hidden UI controls alone do not secure data.
- `campus_records` is a JSONB record table keyed by a constrained `kind`, rather than separate relational tables for every feature.
- Keep the five role values aligned with types and SQL: `Student`, `Club Leader`, `Faculty`, `Student Council`, `Admin`.

## Authentication, data, and demo mode

- `.env.example` names `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; never commit secret keys or environment values.
- Supabase Auth handles email/password sign-in, sign-up, and reset. A database trigger creates a default Student profile. Role assignment is administrative.
- Preview mode uses browser `localStorage` and is not an authenticated account. The workspace also saves a per-profile demo-state snapshot; configured sessions additionally read/write selected `campus_records`.
- Many figures and some interactions are seeded/demo data. Consult `README.md` and `.ai/ARCHITECTURE.md` for persistence boundaries and known production gaps.

## Commands and checks

- `npm.cmd install` / `npm install` — install dependencies.
- `npm.cmd run dev` — run the development server.
- `npm.cmd run build` — production build (includes Next.js type validation).
- `npm.cmd run start` — run the production build.
- `npx tsc --noEmit` — standalone TypeScript check; Next-generated types may need to exist first.
- `test_all_features.py` is a standalone Playwright script; it is not wired to an npm test script and expects a local server at port 3000. Python Playwright is not declared in `package.json`.

## Current state and limitations

The latest codebase splits the 18 workspace sections into dedicated components under `components/modules/`. Login remains in `app/login/page.tsx`. Supabase schema and RLS are present. The UI still contains demo fixtures and simulations; `README.md` lists payment settlement, production QR validation, private multi-party messaging, OCR, and independently auditable anonymous ballots as unfinished production work. No CI or deployment configuration is checked in; Vercel steps are documented in `README.md`.

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
