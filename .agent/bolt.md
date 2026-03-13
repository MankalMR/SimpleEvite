## 2026-03-09 - [Add Cache-Control headers to public APIs]
**Learning:** The `src/app/api/invite/[token]/route.ts` route, which acts as the public entry point for viewing invitations via link, was missing Next.js `Cache-Control` headers. This means requests weren't being cached by the browser or CDN, leading to slower page loads and unnecessary database queries.
**Action:** Add `Cache-Control` header to `/api/invite/[token]/route.ts` to enable caching for public invitations.
