# Agent Guide: Simple Evite

## 1. Project Overview
**Simple Evite** is a frictionless event invitation platform. Its core value proposition is **"Link-based Access"**: guests RSVP via a unique token (`share_token`) without creating an account, while creators use Google OAuth to manage events.

The system is a **Next.js 15 Monolith** using **Supabase** for persistence and **Resend** for emails.

## 2. Documentation Index
The detailed documentation has been split into task-specific files in `agent_docs/`. **Read the relevant files before starting your task.**

| File | Purpose | When to Read |
| :--- | :--- | :--- |
| **[Building the Project](agent_docs/building_the_project.md)** | Setup & Run commands | Starting a new session or fixing build issues. |
| **[Running Tests](agent_docs/running_tests.md)** | Testing & Quality | Before running tests or submitting PRs. |
| **[Code Conventions](agent_docs/code_conventions.md)** | Patterns & Style | Before writing any code. |
| **[Service Architecture](agent_docs/service_architecture.md)** | System Design | Understanding the monorepo structure and layers. |
| **[Database Schema](agent_docs/database_schema.md)** | Data Model & RLS | modifying the DB or working with DTOs. |
| **[Communication Patterns](agent_docs/service_communication_patterns.md)** | API & Services | Integrating new services or debugging API flows. |

## 3. Repository Layout
```text
simple-evite/
├── agent_docs/             # Context-specific documentation (See Index above)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # BFF Layer: API Routes (Controllers)
│   │   └── page.tsx        # UI Pages
│   ├── components/         # React UI Components (Tailwind + Shadcn)
│   ├── lib/
│   │   ├── database-supabase.ts # DAL: Repository Pattern Implementation
│   │   ├── email-service.ts     # Resend Wrapper
│   │   └── security.ts          # Sanitization & Validation logic
│   └── types/              # TypeScript Definitions
├── database-schema.sql     # Canonical SQL Schema (Supabase)
└── package.json            # Scripts & Dependencies
```

## 4. Task Examples

### Task: Add "Dietary Requirements" to RSVP
1.  **DB**: Add `dietary_requirements TEXT` column via SQL migration.
2.  **DTO**: Update `rowToRSVP` in `database-supabase.ts` (See `database_schema.md`).
3.  **API**: Update validation in `src/lib/security.ts`.
4.  **UI**: Add input field to `rsvp-form.tsx`.

### Task: Create "Event Reminder" Cron
1.  **API**: Create `src/app/api/cron/reminders/route.ts`.
2.  **Logic**: Query events happening in 24h.
3.  **Service**: Call `sendEventReminderEmail`.

## 5. Do's and Don'ts

### DO
- **Prioritize Security**: always validate the `share_token` before showing event details.
- **Use the DAL**: All DB operations must go through `src/lib/database-supabase.ts`.
- **Sanitize**: Use the `escapeHTML` or `sanitizeText` helpers for all user-generated content.
- **Read Specs**: Check `agent_docs/code_conventions.md` before refactoring.
- **Use Demo Mode for UI Testing**: ALWAYS use the Demo App at `http://localhost:3008/demo/dashboard` to test UI changes or basic flows. It bypasses Google Sign-In and uses isolated, in-memory seed data.

### DON'T
- **Don't** add `supabase-js` calls inside Client Components (`.tsx`).
- **Don't** change the port (3008) in `package.json`.
- **Don't** commit secrets or `.env` files.
- **Don't** remove the DTO mapping layer.
