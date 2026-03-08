## 2026-03-08 - Environment Configuration for Next.js 15 Static Builds
**Learning:** Next.js 15 statically evaluates cron and API routes during `npm run build`, causing the build to fail if required environment variables (like `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, etc.) are absent.
**Action:** Ensure a complete `.env.local` containing all necessary API keys is created before running tests/builds in development or CI environments.
