## 2024-03-10 - Initial Setup
**Learning:** Initializing Bolt's journal.
**Action:** Created `.agent/bolt.md`.

## 2024-03-10 - Cache-Control for Public Invites
**Learning:** Public guest invitation lookups (`/api/invite/[token]/route.ts`) have no Next.js `Cache-Control` headers, meaning the database is hit for every single view by every guest. Since this is the "frictionless" public-facing route that might see the most traffic per event, it represents a substantial opportunity to improve TTFB and reduce DB load.
**Action:** Add a Next.js `Cache-Control` header (e.g. `s-maxage=60, stale-while-revalidate=300`) to the public API route.
## 2026-03-11 - Resolve N+1 query problem for invitations list\n**Learning:** When fetching nested relations where foreign keys are generic strings that could reference multiple tables (e.g. `design_id` referencing either `designs` or `default_templates`), standard PostgREST joins won't work out of the box. \n**Action:** Avoid N+1 sequential fetching inside mapping functions by using `Set` to extract unique IDs and using `.in('id', array)` bulk queries instead, mapping the result back synchronously.
