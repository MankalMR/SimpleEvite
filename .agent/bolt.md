## 2024-03-10 - Initial Setup
**Learning:** Initializing Bolt's journal.
**Action:** Created `.agent/bolt.md`.

## 2024-03-10 - Cache-Control for Public Invites
**Learning:** Public guest invitation lookups (`/api/invite/[token]/route.ts`) have no Next.js `Cache-Control` headers, meaning the database is hit for every single view by every guest. Since this is the "frictionless" public-facing route that might see the most traffic per event, it represents a substantial opportunity to improve TTFB and reduce DB load.
**Action:** Add a Next.js `Cache-Control` header (e.g. `s-maxage=60, stale-while-revalidate=300`) to the public API route.
## 2024-03-10 - O(N) queries in Data Access Layer
**Learning:** `rowToInvitationWithRSVPs` resolves the polymorphic `design_id` relation by firing a sequential query for every single invitation (either to `designs` or `default_templates`). This results in an N+1 query problem, especially painful in `getInvitations`.
**Action:** Extract unique missing design IDs, perform an O(1) bulk fetch using `.in('id', array)`, and use synchronous mapping instead of sequential `Promise.all` database calls.

## 2026-03-14 - Supabase PGRST200 Foreign Key Error
**Learning:** When trying to optimize N+1 queries by embedding nested selects in Supabase (e.g. `designs:designs(...)`), PostgREST will throw a `PGRST200` error ("Could not find a relationship...") and crash the API route (returning a 500 status) if the underlying Postgres table lacks an explicit Foreign Key constraint. The `invitations` table does NOT have a strict foreign key to `designs` or `default_templates`.
**Action:** Do NOT use nested `.select('*, relation(*)')` syntax in Supabase for relationships that aren't strictly defined by Postgres Foreign Keys. Always fallback to manual `O(1)` bulk filtering (`.in('id', ids)`) in the application layer to resolve these soft-relations safely without crashing.

## 2024-03-15 - Improve LCP for Hero Images
**Learning:** Next.js `<Image>` component lazy-loads images by default. When used for "above-the-fold" hero images (like `InvitationDisplay`), this causes a delay and hurts the Largest Contentful Paint (LCP) performance metric.
**Action:** Add `priority={true}` to the `<Image>` component for hero images to disable lazy loading and significantly improve LCP.
## 2026-03-17 - React.memo on InvitationDisplay
 **Learning:** The `InvitationDisplay` component is a purely stateless visual component that is heavily re-rendered within the `InvitationPreview` and form components on every keystroke. Next.js App Router "use client" components like forms cause deep re-renders by default.
 **Action:** Wrapped `InvitationDisplay` in `React.memo` to eliminate unnecessary reconciliation cycles, significantly improving typing responsiveness in the creation/edit forms.
