# Development Changelog

## [2026-10-03] - Adopt Modular Architecture and Polish Login
- Adopted the latest `origin/main` modular refactor as the local `main` baseline.
- Refined the login page layout while preserving its auth and preview flow.
- Updated AI context docs to match the component modules, shared types, and standalone Playwright script.
## [2026-10-03] - Login Story Hero & Illustration Layout Correction
- **Unobstructed Hero Typography**: Resolved overlapping illustration issue on `/login` where the decorative green landscape hills (`.login-hill`) overlapped the hero heading ("Your campus is better together.") and description copy.
- **Structural Separation**: Separated `.login-story-art` from inside `.login-story-copy` into a dedicated sibling container anchored directly to the bottom of `.login-story` with `bottom: 0`, `height: 170px`, `z-index: 1`, and `pointer-events: none`. Elevated `.login-story-copy` to `z-index: 10` with centered vertical spacing.
- **Visual Verification**: Rendered and captured headless browser screenshot confirming complete, crisp legibility of headline, subtitle, and footer with rolling hills cleanly positioned at the base. All 56 automated test suites re-verified with 100% PASS.

## [2026-10-03] - Browser Extension Attribute Neutralization Shield
- **Targeted Root Boundary Protection**: Injected early client-side DOM & console interception shield into `<head suppressHydrationWarning>` in `app/layout.tsx`.
- **Extension Immunity**: Intercepts `Element.prototype.setAttribute`, attaches a high-priority `MutationObserver` to strip `bis_*` attributes (e.g. `bis_skin_checked="1"` from Bitdefender / Hover extensions) before React processes them, and silences Next.js dev overlay triggers for extension-injected attribute mismatches on root metadata boundaries (`\__next_metadata_boundary__`).
- **Verified**: Full test suite (`test_all_features.py`) re-executed with 56/56 PASS.

## [2026-10-03] - Global Typography & Small Text Legibility Refinement
- **Accessible & Comfortable Micro-Copy**: Raised undersized labels, timestamps, metadata, and helper text across the entire website from illegible 6px–9px thresholds up to balanced 10.5px–13.5px scales with crisp monospace tracking (`DM Mono`) and legible body copy (`DM Sans`).
- **Targeted Improvements Across Modules**:
  - **Announcements**: Elevated feed meta (`ALL STUDENTS · Today · Student Council`), card copy, audience tags, channel footers, and pin action buttons to 11px–13.5px.
  - **Overview & Dashboard**: Scaled quick stats sub-labels, activity timestamps, event badges, and banner actions.
  - **Sidebar & Topbar**: Increased campus switch subtitles, role switch select labels, navigation badge counters, and breadcrumbs to 11px–12.5px.
  - **Discover Clubs, Events & Volunteering**: Raised member counts, category chips, date sub-labels, spot availability tags, and registration buttons.
  - **Modals, Forms & Popovers**: Improved ticket stubs, modal descriptions, toast messages, notification dropdown items, and form helper copy.
- **Verification**: Verified visual balance with Playwright browser screenshots and re-ran the full automated test suite (`test_all_features.py`) with 56/56 PASS (0 failures, 0 console errors).

## [2026-10-03] - Hydration Mismatch Resolution & 100% Automated Test Suite Verification
- **Hydration Error Resolution**: Resolved Next.js SSR/Client hydration error (`bis_skin_checked="1"`) caused by browser extensions (e.g. Bitdefender, privacy extensions) injecting attributes into DOM nodes before React hydration by applying `suppressHydrationWarning` on `<html lang="en">`, `<body>`, and `<main>` root shells across `app/layout.tsx`, `app/page.tsx`, and `app/login/page.tsx`.
- **Installed Testing Skill**: Added and configured `anthropics/skills@webapp-testing` with headless Playwright automation.
- **End-to-End Automated Testing**: Executed comprehensive test suite (`test_all_features.py`) covering all 20 modules and button suites:
  - Sign in / sign up tab toggles and demo mode entry.
  - Topbar notifications popover and real-time role switching across all 5 roles.
  - Overview stats shortcuts, ticket pass modal opening, and bottom banner navigation.
  - Discover clubs category filtering, search, join/leave toggle, and "Start a club" modal creation.
  - Events digital ticket modal, RSVP check-in, and inline event creation form.
  - Volunteers registration apply and My Commitments confirmed tab.
  - Tasks checklist toggle, inline task addition, and task deletion.
  - Marketplace product listing creation and inquiry navigation to Messages.
  - Messages multi-channel thread switching and real-time sending.
  - Help desk topic upvoting, ticket submission form, and moderator status cycling.
  - Finance transaction recording and ledger updating.
  - Student Council initiative support toggle, proposal sharing modal, and election rules modal.
  - Elections candidate voting state disablement.
  - Administration member search and role modification select.
  - College Portal handbook modal, offer saving toast, and club directory linking.
  - Membership benefits modal, dues renewal, and reminder toast.
  - Announcements pin button and studio publishing.
  - Club Shop cart addition and order checkout modal.
  - Achievements leaderboard switching and profile editing modal.
  - Club Dashboard theme switcher, public preview modal, and management shortcuts.
  - Session sign-out and login redirect.
- **Test Result**: **56/56 PASS (100%)**, 0 failures, 0 console errors.

## [2026-10-03] - Comprehensive Website & Logic Fixes
- **Unified & Durable State Management**: Elevated all 18 module states in `app/page.tsx` (`clubs`, `events`, `tickets`, `checkedIn`, `commitments`, `volunteerOpportunities`, `tasks`, `issues`, `products`, `messages`, `memberships`, `announcements`, `shopItems`, `cart`, `financeEntries`, `councilIdeas`, `theme`) with continuous local storage persistence and Supabase activity syncing.
- **Authentication & Preview Hydration**: Fixed redirect loop when Supabase was initialized without an active session by honoring the local demo preview role (`campus-commons-preview-role`).
- **Interactive Role Switcher**: Added live `.role-switch` dropdown in the topbar for preview mode, allowing immediate role switching across `Student`, `Club Leader`, `Faculty`, `Student Council`, and `Admin`.
- **Ticketing & QR Check-In**: Enabled re-opening of digital tickets with large QR code pass modal for already-saved tickets; validated demo check-in with persistent state.
- **Volunteer System**: Dynamic calculation of volunteer hours and gamified points; enabled real commitment registration and live tab counts.
- **Finance Ledger**: Made total available balance, income, and spending dynamic based on `financeEntries`; added inline transaction recording for campus officers with Supabase syncing.
- **Multi-Channel Messaging**: Activated channel switching across Student Council, Design Society, Welcome Fair Crew, and Robotics & AI with isolated threads and correct sender bubble alignment.
- **Help Desk Moderation**: Added issue status cycling (`Open` → `In review` → `Assigned` → `Resolved`), upvoting with activity tracking, and deletion capabilities for moderators.
- **Council & Club Proposals**: Functional "Start a club" and "Share an idea" modals that add new entities directly to the live feed and database.
- **Club Shop & Cart**: Implemented stock decrement, variant details, order cart review modal, and checkout placement.
- **Gamified Achievements**: Dynamically derived badges, points, hours, and department leaderboards reflecting live user actions.
- **CSS & UI Polish**: Added missing styling in `app/globals.css` for finance creation, notification popover, issue status badges, and cart drawers.
- **Compilation & Build Verified**: Verified zero TypeScript errors (`tsc --noEmit`) and successful production build (`next build`).

## [2026-10-03] - Role-Aware SRS Frontend Modules
- Connected git remote and synchronized local workspace with `origin/main` (`ac40624`).
- Added 6 new SRS role-aware frontend modules (`College portal`, `Membership`, `Announcements`, `Club shop`, `Achievements`, `Club dashboard`).
- Expanded total navigation surface to 18 campus sections with full role-based access rules.
- Added corresponding CSS styling in `app/globals.css` for new modules, themes (`forest` / `sunset`), and responsive layouts.
- Updated `.ai/PROJECT_CONTEXT.md`, `.ai/CODEBASE_MAP.md`, and `.ai/ARCHITECTURE.md`.

## Initial Codebase Analysis
- Initial codebase analyzed.
- AI context system created.
