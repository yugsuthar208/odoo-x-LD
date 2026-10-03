# System Architecture: Campus Commons

This document details how the Campus Commons system is structured and how data flows across components.

---

## 1. High-Level Architecture Overview

Campus Commons uses a **Direct-to-BaaS (Backend-as-a-Service)** architecture on top of Next.js App Router. The client browser communicates directly with Supabase for authentication and PostgreSQL data management via Row-Level Security (RLS). When Supabase is unconfigured, the application runs entirely client-side using `localStorage`.

```
                  ┌──────────────────────────────────────────────┐
                  │                 User Browser                 │
                  │                                              │
                  │  ┌────────────────────┐ ┌──────────────────┐ │
                  │  │ app/login/page.tsx │ │   app/page.tsx   │ │
                  │  └─────────┬──────────┘ └───┬──────────┬───┘ │
                  │            │                │          │     │
                  │            │      Core UI ──┘          │     │
                  │            │      SrsFrontendPages ────┘     │
                  │            ▼                                 │
                  │       lib/supabase.ts (getSupabase())        │
                  └──────────────────────┬───────────────────────┘
                                         │
                   (If Configured)       │       (If Preview Mode)
            ┌────────────────────────────┴──────────────────────────┐
            ▼                                                       ▼
┌───────────────────────┐                               ┌───────────────────────┐
│     Supabase BaaS     │                               │  Browser LocalStorage │
│                       │                               │                       │
│  ┌─────────────────┐  │                               │  • Preview Role       │
│  │  Supabase Auth  │  │                               │  • Cached Campus State│
│  └────────┬────────┘  │                               └───────────────────────┘
│           │ Trigger   │
│           ▼           │
│  ┌─────────────────┐  │
│  │   PostgreSQL    │  │
│  │ ─────────────── │  │
│  │ public.profiles │  │
│  │ public.campus_  │  │
│  │   records (RLS) │  │
│  └─────────────────┘  │
└───────────────────────┘
```

---

## 2. Frontend Component & Section Architecture

The UI in `app/page.tsx` is structured into two main render paths based on the active `section`:

1. **SRS Frontend Modules (`SrsFrontendPages`)**:
   - `College portal`: High-level college landing view with announcement cards, campus info handbook, and official club directory links.
   - `Membership`: Member dues status (`ACTIVE`, `RENEW SOON`, `PENDING`), dues renewal triggers, and club member benefits.
   - `Announcements`: Broadcast feed with audience targeting and announcement creation studio for leaders and officers.
   - `Club shop`: Official club-managed merchandise with variant listings and live inventory decrement.
   - `Achievements`: Student profile metrics (points, hours, events), badge awards, and departmental leaderboards.
   - `Club dashboard`: Customizable club page engine featuring theme toggles (`forest`, `sunset`) and operation controls.

2. **Core Campus Modules**:
   - `Overview`, `Discover clubs`, `Events`, `Volunteers`, `Tasks`, `Marketplace`, `Messages`, `Help desk`, `Finance`, `Council`, `Elections`, `Administration`.

---

## 3. Authentication & Session Flow

1. **User Sign In / Sign Up**:
   - `app/login/page.tsx` submits email and password to `supabase.auth.signInWithPassword` or `supabase.auth.signUp`.
   - On sign up, `full_name` is passed in `user_metadata`.
2. **Profile Creation Trigger**:
   - PostgreSQL trigger `on_auth_user_created_campus_profile` intercepts the insert in `auth.users` and automatically inserts a record into `public.profiles` with `role = 'Student'`.
3. **Session Verification & Profile Hydration**:
   - `app/page.tsx` calls `supabase.auth.getSession()`.
   - If no session exists, it redirects to `/login`.
   - If a session exists, it queries `public.profiles` for `role` and `full_name`.
   - Role determines visible sections (`roleSections`) and action permissions.
4. **Local Preview Bypass**:
   - In preview mode, role selection (`Student`, `Club Leader`, `Faculty`, `Student Council`, `Admin`) is stored in `localStorage` under `campus-commons-preview-role`.

---

## 4. Data Flow & State Hydration

### Read Flow (Hydration)
1. **Initial Mount**: `app/page.tsx` executes the `hydrate()` effect on mount.
2. **Local Cache Read**: Reads `localStorage.getItem("campus-commons-demo-v1:<profileId>")` to restore any cached or offline state.
3. **Remote Fetch**: Queries `public.campus_records` table (ordered by `created_at asc`).
4. **Merge Strategy**: The `merge()` helper reconciles remote Supabase records with local seed state:
   - `event` records → merged into `events` state.
   - `task` records → merged into `tasks` state.
   - `listing` records → merged into `products` (Marketplace) state.
   - `issue` records → merged into `issues` (Help desk) state.
   - `chat_message` records → merged into `messages` state.
   - `ticket`, `checkin`, `volunteer_application`, `membership`, `vote` → filtered by `created_by` for user-specific badges and statuses.

### Write Flow (Mutations)
1. **User Action**: User creates an event, task, listing, issue, message, or RSVPs to an event.
2. **Optimistic UI Update**: React state immediately updates, giving instant user feedback.
3. **Local Cache Sync**: An effect automatically synchronizes full state back to `localStorage` under the user's profile key.
4. **Remote Record Creation**: Calls `recordActivity(kind, payload)`:
   - Resolves active authenticated user ID.
   - Inserts row into `public.campus_records` with `created_by = user.id`.
   - Supabase RLS enforces role-level authorization on insert.

```
User Action
  │
  ├─► Update React State (Optimistic UI)
  ├─► Sync to localStorage (demo-v1:<key>)
  └─► recordActivity() ──► supabase.from("campus_records").insert()
```

---

## 5. Security & Database Model

### Database Schema

#### `public.profiles`
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | Primary Key, FK to `auth.users.id` | Profile identifier matching auth user |
| `full_name` | `text` | NOT NULL, default `''` | User's display name |
| `role` | `text` | NOT NULL, default `'Student'`, CHECK constraint | `Student`, `Club Leader`, `Faculty`, `Student Council`, `Admin` |
| `created_at`| `timestamptz` | NOT NULL, default `now()` | Timestamp of creation |

#### `public.campus_records`
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Record identifier |
| `kind` | `text` | NOT NULL, CHECK constraint | Entity discriminator (`event`, `task`, `listing`, `issue`, `issue_support`, `chat_message`, `volunteer_application`, `ticket`, `checkin`, `vote`, `membership`, `announcement`, `finance_entry`) |
| `payload` | `jsonb` | NOT NULL, default `'{}'::jsonb` | Arbitrary entity data |
| `created_by`| `uuid` | NOT NULL, FK to `auth.users.id` | Author UUID |
| `created_at`| `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at`| `timestamptz` | NOT NULL, default `now()` | Last modified timestamp |

### Row-Level Security (RLS) Rules
- **Profiles**:
  - Authenticated users can `SELECT` their own profile (`id = auth.uid()`).
  - `Admin` users can view and update all profiles via `public.current_campus_role() = 'Admin'`.
- **Campus Records**:
  - `SELECT`: All authenticated users can read all campus records.
  - `INSERT`: Allowed if `created_by = auth.uid()`, with role validation for restricted types:
    - `event`, `task`, `finance_entry`, `announcement` require `Club Leader`, `Faculty`, `Student Council`, or `Admin`.
    - `listing` requires `Student`, `Club Leader`, `Student Council`, or `Admin`.
    - Other types (`ticket`, `checkin`, `chat_message`, `issue`, etc.) are open to all authenticated users.
  - `UPDATE` / `DELETE`: Permitted only for the record creator (`created_by = auth.uid()`) or campus officers (`Faculty`, `Student Council`, `Admin`).

---

## 6. Architectural Decisions & Trade-offs

1. **Polymorphic `campus_records` Document Store**:
   - *Decision*: Storing all activity types in one JSONB-driven table rather than individual normalized SQL tables.
   - *Rationale*: Allows rapid iteration, zero schema migrations when modifying UI entity shapes, and a single synchronization pipeline.
   - *Trade-off*: Relies on schema validation in JSON payloads and application-level type consistency rather than relational foreign keys.
2. **Direct Client-to-Supabase Queries**:
   - *Decision*: Eliminates intermediary Next.js API routes (`app/api/*`).
   - *Rationale*: Reduces server compute, leverages Supabase built-in PostgREST API, and enforces authorization at database level with RLS.
3. **Dual Online / Offline Execution Mode**:
   - *Decision*: Fallback to `localStorage` and client state if Supabase environment variables are not supplied.
   - *Rationale*: Allows instant offline prototyping, testing, and UI evaluation without setting up an external database project.
4. **Distinction between Club Shop & Marketplace**:
   - *Decision*: Official club merchandise is isolated in `Club shop` with inventory control, separate from student-to-student `Marketplace` reuse listings.
