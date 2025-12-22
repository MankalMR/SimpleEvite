# Code Conventions

## Languages & Frameworks
- **Language**: TypeScript (Strict mode).
- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS + Shadcn/UI.
- **State**: React Hooks (`useState`, `useEffect`) + `useSession` (Auth).

## Architecture Patterns

### Repository Pattern (Critical)
- **Rule**: **NEVER** write SQL or `supabase.from(...)` calls directly inside API routes or Components.
- **Pattern**: All database logic resides in `src/lib/database-supabase.ts`.
- **Reason**: Decouples logic from the persistence layer and ensures consistent DTO mapping.

### Backend-For-Frontend (BFF)
- **Rule**: Client Components (`.tsx`) must NEVER call Supabase directly.
- **Pattern**: Components fetch data from `/api/*` routes.
- **Reason**: Security and Centralized Authorization.

## Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `email-service.ts`)
- **Directories**: `kebab-case` (e.g., `src/components/ui`)
- **Functions/Variables**: `camelCase` (e.g., `getInvitations`)
- **React Components**: `PascalCase` (e.g., `InvitationForm`)
- **Database Tables**: `snake_case` (e.g., `options_transactions`)

## Directory Structure
- `src/app/api`: Server-side API Controllers.
- `src/components`: Reusable UI elements.
- `src/lib`: Core business logic and adapters (DAL, Security, Email).
- `src/types`: Shared TypeScript interfaces.
