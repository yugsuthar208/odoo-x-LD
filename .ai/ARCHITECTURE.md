# Architecture

## Overview

The app uses Next.js App Router for two pages. Interactive screens are client components. `app/page.tsx` owns shared workspace state and routes the active section to dedicated components in `components/modules/`. Navigation lives in `components/navigation/`, while `components/modals/ModalProvider.tsx` centralizes dialogs.

```text
Browser
  ├─ /login → Supabase Auth (when configured)
  └─ /      → app/page.tsx state and role logic
               ├─ components/navigation/*
               ├─ components/modules/*
               ├─ components/modals/ModalProvider.tsx
               ├─ localStorage (preview and local state snapshot)
               └─ lib/supabase.ts → Supabase Auth / Postgres REST
```

There is no custom API/server layer or ORM. `@supabase/supabase-js` sends browser-side auth and database requests to Supabase; Postgres RLS governs persisted-record access.

## Authentication and roles

1. `lib/supabase.ts` initializes a singleton browser client only when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are available.
2. `app/login/page.tsx` uses Supabase password sign-in, sign-up, and password reset. Preview entry stores a selected role in local storage and is not a real account.
3. `app/page.tsx` checks the session and loads the corresponding `profiles` record. The role is used to choose visible sections and permitted controls.
4. `supabase/schema.sql` creates each new profile with the `Student` role. Administrative role updates are described in `README.md`.
5. Database RLS policies check `current_campus_role()` for restricted writes. Frontend role checks improve the UI but do not replace RLS.

## State and persistence flow

- Shared state, seed fixtures, hydration, and `recordActivity` are orchestrated in `app/page.tsx`; feature components receive state and handlers via props.
- A React effect persists workspace state in browser local storage using a per-profile key. Preview role is stored separately.
- When authenticated with Supabase, initial hydration also reads profiles and `campus_records`; supported remote record kinds are mapped into the relevant React state. Admins additionally load the role directory.
- Actions update local state for immediate feedback and selected actions call `recordActivity`, which inserts `{ kind, payload, created_by }` into `public.campus_records`.
- `campus_records` uses a JSONB payload and a constrained kind. Its read/insert/update/delete policies are defined in `supabase/schema.sql`.
- Not every screen or fixture is backed by remote records; many are demo interactions. See `README.md` for known production gaps.

## Database and integrations

- `public.profiles` links a user ID to a name and one of five campus roles.
- `public.campus_records` stores typed activity payloads with creator and timestamps.
- Supabase provides authentication and Postgres access through its client APIs.
- Google Fonts are imported from `app/globals.css` (DM Sans, DM Mono, Fraunces, Patrick Hand).
- No other application service integration is declared.

## Constraints

- The Supabase anon key is public client configuration; do not expose a service-role key.
- Feature UI is modular, but shared state and most orchestration remain centralized in `app/page.tsx`.
- There are no Next.js API route handlers, server-side business logic, ORM, or realtime subscriptions.
- `test_all_features.py` is a separate Playwright script rather than a configured npm test command; its environment assumptions are described in `.ai/PROJECT_CONTEXT.md`.
