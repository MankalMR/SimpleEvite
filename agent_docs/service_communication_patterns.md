# Service Communication Patterns

## Client-Server Communication
- **Protocol**: HTTP/REST.
- **Format**: JSON.
- **Flow**:
  1.  **Frontend** calls `fetch('/api/invitations')`.
  2.  **Next.js API Route** intercepts request.
  3.  **API Route** validates Auth.
  4.  **API Route** calls Service Layer (`src/lib`).

## Internal Service Communication
- **Method**: Direct Function Calls (Monolithic).
- **Pattern**: `Controller` (API Route) -> `Service` (Lib).
- **Example**: `POST /api/invite` -> `supabaseDb.createInvitation()` -> `emailService.sendConfirmation()`.

## External Service Integration

| Service | Interaction Method | Auth Mechanism | Usage |
| :--- | :--- | :--- | :--- |
| **Supabase DB** | `supabase-js` Client | Service Role Key | Data Persistence |
| **Supabase Storage** | `supabase-js` Client | Service Role Key | Image Uploads |
| **Resend** | REST API SDK | API Key | Sending Emails |
| **Google** | OAuth 2.0 | Client ID/Secret | User Login |

## Guest Access Pattern
Guests do not "authenticate" in the traditional sense.
1.  Guest clicks link with `share_token`.
2.  Frontend sends token to `/api/invitations/[token]`.
3.  BFF uses `supabaseAdmin` to query DB by token.
4.  If found, returns details; else 404.
