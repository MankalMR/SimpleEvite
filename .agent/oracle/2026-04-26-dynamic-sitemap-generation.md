# Feature Ticket: Dynamic Sitemap Generation

## Status
completed

## Context
The current `sitemap.ts` is static and only includes a few main pages. It doesn't include public invitations or template categories, which prevents search engines from discovering the bulk of the site's content.

## Objective
Update `src/app/sitemap.ts` to dynamically fetch public invitation tokens and template categories from the database, creating a comprehensive "map" for search engine crawlers.

## Scope
- Update `src/app/sitemap.ts` to use the DAL (`supabaseDb`) to fetch public data.
- Ensure only public-safe data is included.
- Handle pagination or limits for very large numbers of invitations.

## Tech Plan
- Use `supabaseDb.getTemplates()` to list template categories.
- (Optional) Fetch the latest 100-500 public invitations.
- Combine these with static routes.

## Acceptance Criteria
- [ ] `/sitemap.xml` dynamically updates when new templates are added.
- [ ] Publicly viewable invitation links are included in the sitemap.
- [ ] No private dashboard or internal API routes are included.
