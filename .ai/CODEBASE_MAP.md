# Codebase Map

## Important paths

| Path | Responsibility |
| --- | --- |
| `app/layout.tsx` | Root HTML layout, metadata, and global stylesheet import. |
| `app/page.tsx` | Main client workspace: application state, session/profile/data hydration, role capabilities, and module composition. |
| `app/login/page.tsx` | Client sign-in, sign-up, password reset, and local preview entry. |
| `app/globals.css` | Design tokens and shared/responsive styling for all pages and modules. |
| `components/modules/` | Feature screens, one component per workspace section. |
| `components/navigation/` | `Sidebar`, `Topbar`, and `NotificationPopover`. |
| `components/modals/ModalProvider.tsx` | Central modal rendering and modal actions. |
| `components/ui/` | Shared `Icon` and `ModulePage` presentation primitives. |
| `lib/supabase.ts` | Supabase browser client factory and `CampusRole`. |
| `lib/supabase/types.ts` | Shared role, section, data model, and modal types. |
| `supabase/schema.sql` | Postgres schema, profile trigger, helper function, grants, indexes, and RLS. |
| `.env.example` | Public Supabase environment variable names/placeholders. |
| `package.json` | Dependencies and dev/build/start scripts. |
| `test_all_features.py` | Standalone browser interaction script; not an npm test target. |
| `.agents/skills/webapp-testing/` | Checked-in Playwright testing skill and examples. |
| `README.md` | Setup, role assignment, deployment steps, and product limitations. |

## Module components

`components/modules/` contains `OverviewModule`, `DiscoverClubsModule`, `EventsModule`, `VolunteersModule`, `TasksModule`, `MarketplaceModule`, `MessagesModule`, `HelpDeskModule`, `FinanceModule`, `CouncilModule`, `ElectionsModule`, `AdministrationModule`, `CollegePortalModule`, `MembershipModule`, `AnnouncementsModule`, `ClubShopModule`, `AchievementsModule`, and `ClubDashboardModule`.

## Routes and data boundaries

- App Router pages: `/` and `/login`; no custom `app/api/*` route handlers.
- Backend/service layer: none; browser React code calls Supabase directly.
- Database logic: `supabase/schema.sql`; shared client/type logic: `lib/supabase.ts` and `lib/supabase/types.ts`.
- Main interactions/state orchestration: `app/page.tsx`; feature UI/interaction markup: corresponding `components/modules/*` file.
- Configuration: `.env.example`, `next.config.ts`, `tsconfig.json`, and `package.json`.
