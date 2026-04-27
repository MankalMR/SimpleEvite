# Feature Ticket: Homepage SSR Refactor for SEO

## Status
completed

## Context
The current home page (`src/app/page.tsx`) was a Client Component (`'use client'`). It used hooks for session management and redirection. This forced search engines to execute JavaScript to see the primary marketing content and resulted in a slower Largest Contentful Paint (LCP).

## Objective
Convert the homepage into a Server Component to ensure that the primary marketing copy (H1, feature lists, etc.) is delivered as static HTML. This will improve SEO crawlability and performance.

## Scope
- In scope:
  - Remove `'use client'` from `src/app/page.tsx`.
  - Create a new Client Component `src/components/home/HomeHeroActions.tsx` to handle authentication buttons and session-based logic.
  - Create a new Client Component `src/components/home/HomeRedirect.tsx` to handle the dashboard redirection logic.
  - Refactor the main layout of the homepage to use these new components.
- Out of scope:
  - Changing the visual design or branding.
  - Modifying the dashboard or internal pages.

## Tech Plan
- Components:
  - `src/app/page.tsx`: Main Server Component. Fetches the session on the server.
  - `src/components/home/HomeHeroActions.tsx`: Client component for the "Continue with Google" / "Dashboard" buttons.
  - `src/components/home/HomeRedirect.tsx`: Small client component that handles `useEffect` redirection if a user is logged in.
- Logic:
  - Use `getServerSession` in `page.tsx` to decide what to show initially.
  - Ensure all marketing text remains in the Server Component.

## Acceptance Criteria
- [x] The `src/app/page.tsx` file does not contain the `'use client'` directive.
- [x] The primary H1 and marketing copy are rendered on the server (viewable in "View Source").
- [x] Logged-in users are still correctly redirected to the dashboard (handled via client-side redirect component).
- [x] Authentication buttons remain interactive and functional.
