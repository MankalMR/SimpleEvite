# Feature Ticket: Public Template Gallery

## Status
pending-implementation

## Context
Currently, templates are only viewable after signing in. This prevents search engines from indexing the "long-tail" keywords associated with specific events (e.g., "Free Birthday Invitations").

## Objective
Create a public-facing gallery at `/templates` that displays the `DefaultTemplates` from the database. This will provide Google with thousands of relevant keywords and act as a conversion funnel for new users.

## Scope
- Create `src/app/templates/page.tsx` as a Server Component.
- Create occasion-specific landing pages (e.g., `/templates/[occasion]`).
- Ensure the gallery links to the "Create Invitation" flow.

## Tech Plan
- Use `supabaseDb.getTemplates()` to fetch active templates.
- Group templates by `occasion`.
- Implement SEO-friendly slugs.

## Acceptance Criteria
- [ ] `/templates` is accessible without authentication.
- [ ] Template categories (Birthday, Wedding, etc.) have dedicated, indexable sections.
- [ ] Each template has a clear "Use this Template" CTA.
- [ ] Core Web Vitals are optimized for these high-traffic entry points.
