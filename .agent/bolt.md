## 2024-03-10 - Initial Setup
**Learning:** Initializing Bolt's journal.
**Action:** Created `.agent/bolt.md`.

## 2024-03-10 - Cache-Control for Public Invites
**Learning:** Public guest invitation lookups (`/api/invite/[token]/route.ts`) have no Next.js `Cache-Control` headers, meaning the database is hit for every single view by every guest. Since this is the "frictionless" public-facing route that might see the most traffic per event, it represents a substantial opportunity to improve TTFB and reduce DB load.
**Action:** Add a Next.js `Cache-Control` header (e.g. `s-maxage=60, stale-while-revalidate=300`) to the public API route.
## 2024-03-10 - O(N) queries in Data Access Layer
**Learning:** `rowToInvitationWithRSVPs` resolves the polymorphic `design_id` relation by firing a sequential query for every single invitation (either to `designs` or `default_templates`). This results in an N+1 query problem, especially painful in `getInvitations`.
**Action:** Extract unique missing design IDs, perform an O(1) bulk fetch using `.in('id', array)`, and use synchronous mapping instead of sequential `Promise.all` database calls. Include `designs` in `INVITATION_FULL_SELECT` to handle the explicit FK case without extra queries.

## 2026-03-14 - LCP Optimization for Event Images
**Learning:** The main hero image in `InvitationDisplay` is often the Largest Contentful Paint (LCP) element on public invitation pages, but it lacked Next.js image priority, causing slower perceived load times.
**Action:** Added `priority={true}` to the `<Image>` component in `src/components/invitation-display.tsx` to ensure the browser preloads the critical image, significantly improving LCP and user experience.
