# Codebase Map: Campus Commons

This map documents the active directories, files, and architectural entry points in the project.

---

## Directory Overview

```
.
├── .ai/                    # Persistent AI context and documentation
├── app/                    # Next.js App Router root (Pages, Layout, Global CSS)
│   ├── login/              # Authentication and preview role selection page
│   ├── globals.css         # Complete application stylesheet & design tokens
│   ├── layout.tsx          # Root HTML layout & page metadata
│   └── page.tsx            # Main campus application dashboard & all 18 modules
├── lib/                    # Shared client utilities
│   └── supabase.ts         # Supabase client singleton initialization & types
├── supabase/               # Database definitions
│   └── schema.sql          # PostgreSQL DDL, RLS policies, functions, & triggers
├── .env.example            # Template for environment variables
├── .gitignore              # Git ignore configuration
├── next.config.ts          # Next.js build configuration
├── package.json            # Node.js project manifest & dependencies
├── README.md               # User onboarding & deployment guide
└── tsconfig.json           # TypeScript compiler configuration
```

---

## Important Files & Their Roles

| File | Category | Purpose |
| --- | --- | --- |
| `app/page.tsx` | Frontend (Main) | Main single-page application dashboard containing 18 campus modules, `SrsFrontendPages` subcomponent, role switching, hydration from Supabase/localStorage, local state, and modals. |
| `app/login/page.tsx` | Frontend (Auth) | Authentication screen supporting Sign In, Sign Up, Password Reset, and Local Demo Preview role selection. |
| `app/layout.tsx` | Frontend (Layout) | Root App Router layout importing `globals.css` and configuring metadata. |
| `app/globals.css` | Styling | Centralized stylesheet: CSS custom properties, responsive layouts, typography, component styling, animations, SRS module styles, and responsive themes. |
| `lib/supabase.ts` | Utilities / BaaS | Singleton client factory for `@supabase/supabase-js` and export of `CampusRole` type. |
| `supabase/schema.sql` | Database Schema | PostgreSQL schema definition, `profiles` & `campus_records` tables, RLS security policies, and triggers. |
| `next.config.ts` | Configuration | Next.js configuration. |
| `package.json` | Configuration | Dependencies (`next`, `react`, `react-dom`, `@supabase/supabase-js`, `typescript`), scripts, and engine specs. |
| `tsconfig.json` | Configuration | TypeScript compiler settings (strict mode, bundler resolution). |

---

## Where Logic Lives

### 1. Application Entry Points
- **Root Page**: `app/page.tsx` — Entry point for authenticated users and local preview mode.
- **Auth Page**: `app/login/page.tsx` — Entry point for login, registration, and role preview selection.
- **Root HTML Shell**: `app/layout.tsx` — Mounts HTML/body and loads global CSS.

### 2. Frontend Logic
- **Tab Navigation & Role-Based Views**: `app/page.tsx` (Lines 6–40, 160–176)
- **SRS Frontend Modules (`SrsFrontendPages`)**: `app/page.tsx` (Lines 43–66)
  - `College portal`: News feed, campus info, student discounts, and official club directory.
  - `Membership`: Active membership list, dues status, renew CTA, and member benefits.
  - `Announcements`: Live announcement feed and announcement publishing composer.
  - `Club shop`: Official club merchandise catalog with inventory stock decrement.
  - `Achievements`: Student profile points/hours stats, earned/locked badges, volunteer & marketplace leaderboards.
  - `Club dashboard`: Customizable club page engine preview with theme switching (`forest` / `sunset`) and leader tools.
- **Core Dashboard Modules**: `app/page.tsx` (Lines 223–248)
  - `Overview`, `Discover clubs`, `Events`, `Volunteers`, `Tasks`, `Marketplace`, `Messages`, `Help desk`, `Finance`, `Council`, `Elections`, `Administration`.
- **State Hydration & Sync**: `app/page.tsx` (Lines 93–158)
- **Auth UI & Form Handlers**: `app/login/page.tsx` (Lines 19–43)

### 3. Backend & BaaS Logic
- **Supabase Client Factory**: `lib/supabase.ts`
- **Database Trigger Functions & Role Check Helpers**: `supabase/schema.sql` (`create_campus_profile()`, `current_campus_role()`)

### 4. Database Logic & Security
- **Schema & Tables**: `supabase/schema.sql` (`public.profiles`, `public.campus_records`)
- **Row-Level Security (RLS) Policies**: `supabase/schema.sql` (Role-based insert permissions, owner/officer update/delete rules)

### 5. API & Routes
- *Note*: There are currently no Next.js API route handlers (`app/api/*`). Direct queries are made to Supabase via `@supabase/supabase-js`.

### 6. Shared Utilities & Types
- **Supabase Client & `CampusRole`**: `lib/supabase.ts`

### 7. Configuration & Environment
- **Environment Templates**: `.env.example`
- **Next.js Config**: `next.config.ts`
- **TypeScript Config**: `tsconfig.json`
- **Project Dependencies**: `package.json`
