# Database Schema & Data Models

## Core Tables
The database is hosted on **Supabase** (PostgreSQL).

### `users`
- Stores profile info for Creators.
- Linked to NextAuth sessions via email.

### `invitations`
- **Primary Entity**.
- Key Fields:
  - `user_id`: Owner (Creator).
  - `share_token`: **UUID** used for Guest Access (Capabilities Pattern).
  - `design_id`: Link to custom design image.

### `rsvps`
- Guest responses.
- Key Fields:
  - `invitation_id`: Link to parent event.
  - `response`: Enum (`yes`, `no`, `maybe`).
  - `comment`: User text (Must be sanitized).

## Security Model (RLS)
- **Strategy**: **Permissive RLS**.
- **Policies**: Most tables have generic `true` policies (e.g., "Users can view profiles").
- **Enforcement**: Security is **NOT** enforced by the database engine for logic flow. It is enforced by the **API Layer** (BFF).
- **Reasoning**: To allow anonymous guests (who have no DB user) to read/write RSVPs via the backend's Service Role (`supabaseAdmin`) without complex Postgres policies.

## Data Transfer Objects (DTOs)
There is a strict separation between Database Rows and Application Objects.

- **DB**: `snake_case` (e.g., `event_date`)
- **App**: `camelCase` (e.g., `invitations` object structure in frontend often matches DB for simplicity in this specific project, but the `rowToInvitation` helper in `database-supabase.ts` formalizes this boundary).

**Critical Rule**: If you add a column to the DB, you **MUST** update the `rowTo*` mapper functions in `src/lib/database-supabase.ts`.
