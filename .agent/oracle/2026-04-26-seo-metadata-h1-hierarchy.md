# Feature Ticket: SEO Metadata and H1 Hierarchy Optimization

## Status
pending-implementation

## Context
The current homepage lacks a strong keyword-focused H1 and H2 hierarchy. While metadata exists, it could be more aggressively optimized for high-volume terms like "evite," "online invitations," and "free RSVP tracking."

## Objective
Update the homepage content and metadata to use "Semantic SEO" principles, ensuring that the most important keywords are prominent in the H1 and metadata fields.

## Scope
- Update `metadata` in `src/app/layout.tsx` or `src/app/page.tsx`.
- Refactor the H1 and H2 headings on the homepage.
- Optimize the `description` and `keywords` tags in `src/lib/seo.ts`.

## Tech Plan
- Use keywords identified in the SEO strategy: "Digital Invitations," "Online RSVP," "Free Invitation Maker."
- Ensure there is only one `<h1>` per page.
- Use `<h2>` for major feature sections.

## Acceptance Criteria
- [ ] Homepage has a single `<h1>` containing primary keywords.
- [ ] Feature sections use `<h2>` tags.
- [ ] Meta title and description are updated with high-conversion copy.
- [ ] Open Graph tags are verified to match the new metadata.
