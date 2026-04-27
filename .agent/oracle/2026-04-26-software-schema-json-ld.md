# Feature Ticket: Software and Event Schema (JSON-LD)

## Status
pending-implementation

## Context
Google uses structured data to provide "Rich Snippets" in search results. Currently, the homepage lacks explicit schema to identify it as a Software Application or a Web Site.

## Objective
Implement JSON-LD structured data using Schema.org vocabularies on the home page and invitation pages to improve visibility and click-through rates (CTR).

## Scope
- Add `WebSite` and `SoftwareApplication` schema to the homepage.
- Enhance the existing `Event` schema on invitation pages.
- Add `BreadcrumbList` schema for navigation.

## Tech Plan
- Update `generateStructuredData` in `src/lib/seo.ts`.
- Inject JSON-LD using `<script type="application/ld+json">` in layouts.

## Acceptance Criteria
- [ ] Google Rich Results Test passes for the homepage.
- [ ] Search results display "Free" price indicators and app details.
- [ ] Event details (date, location) are correctly highlighted in search results for public invites.
