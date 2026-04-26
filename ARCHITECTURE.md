# Simple Evite - Technical Architecture

## 1. System Purpose & Responsibilities
**Simple Evite** is a frictionless event invitation platform designed to democratize event management by removing the barrier of account creation for guests.
*   **Core Philosophy**: "Link-based Access". Guests interact via unique tokens (`share_token`), never needing a password.
*   **Key Capabilities**:
    *   **Creators**: OAuth login, drag-and-drop invitation design, dashboard management.
    *   **Guests**: Zero-friction RSVP (Yes/No/Maybe), comments, and calendar integration.
    *   **System**: Automated reminders (cron) and transactional emails (Resend).

---

## 2. High-Level Architecture Diagram
The system operates as a **Next.js Monolith** on Vercel, leveraging a **Service-Based Architecture** internally.

```mermaid
graph TD
    User[Creator] -->|NextAuth Session| UI[Frontend UI]
    Guest[Guest] -->|Share Token| UI
    
    subgraph "Next.js Monolith (Vercel)"
        UI -->|Fetch API| BFF[Backend-for-Frontend (API Routes)]
        
        subgraph "Service Layer"
            BFF -->|Authorize| Security[Security Service]
            BFF -->|Persistence| Repo[Supabase Repository]
            BFF -->|Notify| Email[Email Service]
        end
    end

    subgraph "External Infrastructure"
        Security -->|OAuth| Google[Google Identity]
        Repo -->|Postgres| DB[(Supabase Database)]
        Repo -->|Assets| Storage[Supabase Storage]
        Email -->|SMTP REST| Resend[Resend Platform]
    end
```

---

## 3. Detailed Component Analysis

### 3.1 Frontend Subsystem
*   **Location**: `src/app`, `src/components`
*   **Responsibilities**:
    *   Orchestrates the user journey from Landing Page -> Dashboard -> Create Flow.
    *   Manages ephemeral UI state (loading spinners, form validation errors).
    *   Consumes the BFF (`/api/*`) rather than talking to Supabase directly.
*   **Key Modules**:
    *   `page.tsx`: Landing page with conditional rendering based on Session state.
    *   `invitation-form.tsx`: Complex multi-step form for creating events. Supports rich customization including Google Font selection, Title/Description visibility toggles, and Organizer Notes.
    *   `invitation-display.tsx`: Public-facing view for guests (consumes `share_token`).
*   **Patterns**:
    *   **Client Components**: Heavy use of `useClient` for interactive forms.
    *   **Optimistic UI**: (Implicit) UI updates immediately on check interactions (RSVP toggles).

### 3.2 Backend-for-Frontend (BFF)
*   **Location**: `src/app/api`
*   **Responsibilities**:
    *   **Gatekeeper**: Validates every request.
    *   **Creator Actions**: Checks `getServerSession` (NextAuth).
    *   **Guest Actions**: Checks `share_token` (UUID) against the database.
*   **Key Modules**:
    *   `api/invitations/route.ts`: CRUD for events. Enforces that `user_id` matches the session.
    *   `api/rsvp/route.ts`: Public endpoint. Validates input using `security.ts` before writing.
*   **Patterns**:
    *   **Controller-Service**: The API route acts as a controller, delegating logic to `src/lib`.

### 3.3 Data Access Layer (DAL)
*   **Location**: `src/lib/database-supabase.ts`
*   **Responsibilities**:
    *   **Supabase Adapter**: Directly manages user/account sessions in the `next_auth` schema, eliminating the need for manual `email -> id` lookups.
    *   **supabaseAdmin**: A service-role client used by the BFF to bypass RLS when necessary (or when operating on behalf of a guest).
    *   **Structured Logging**: Integrated **Pino** for JSON-formatted, high-performance logging across both client and server.

### 3.4 Service Layer: Email
*   **Location**: `src/lib/email-service.ts`
*   **Responsibilities**:
    *   Constructs HTML email templates (using inline styles for client compatibility).
    *   Wraps the **Resend** API.
    *   Handles "Reminder" logic (`prepareReminderData`).
*   **Dependencies**: `resend` SDK.

### 3.5 Security Service
*   **Location**: `src/lib/security.ts`
*   **Responsibilities**:
    *   **Sanitization**: Uses `DOMPurify` to clean HTML inputs (prevent XSS in comments).
    *   **Validation**: Regex patterns for Email, Phone, and Safe Text.
    *   **Rate Limiting**: In-memory map (for dev) to throttle abuse. *Note: Should be Redis in prod.*

---

## 4. Services & Interactions

| Service | Type | Role | Interaction Method |
| :--- | :--- | :--- | :--- |
| **Next.js** | App Server | Core Application Logic | Internal Function Calls |
| **Supabase DB** | Database | Persistence (Users, Events, RSVPs) | Supabase JS Client (HTTPS) |
| **Supabase Storage** | Object Store | Hosting user-uploaded invitation images | Supabase JS Client (HTTPS) |
| **Resend** | Email API | Transactional Notifications | REST API |
| **Google OAuth** | Identity | Authenticating Creators | OIDC / OAuth Flow |

## 5. Architectural Patterns Summary

1.  **Repository Pattern**: decoupling API routes from the database implementation.
2.  **BFF Pattern**: The Next.js API routes serve as a specific backend for the React UI, handling auth aggregation.
3.  **Token-Based Access**: The `share_token` (UUID) acts as a capability key for guests, bypassing the need for a user account.
4.  **Service-Role Access**: The backend often uses `supabaseAdmin` (Service Role) to perform actions that RLS might block for unauthenticated users (like Guest RSVPs), enforcing logic in code instead.
