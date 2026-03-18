#Feature Ticket : Immediate RSVP Confirmation &Event Update Emails

## Status
pending-implementation

## Context
Currently, the email notification system in Simple Evite relies solely on a daily cron job that sends a reminder email to guests 2 days before an event. However, guests who RSVP "Yes" and provide their email do not receive any immediate confirmation, which can leave them unsure if their RSVP was successful. Furthermore, if a host updates the event details (e.g., changing the time or location) after guests have already RSVP'd, there is no automated way to notify them of these critical changes.

## Objective
Enhance the existing email system to immediately send a confirmation email when a guest RSVPs "Yes" with their email address. This confirmation email must include the event details and an "Add to Calendar" link. Additionally, when a host updates an event's core details (date, time, or location), the system should automatically send an "Event Updated" email to all guests who have RSVP'd and opted in to emails. The existing 2-day reminder cron job must remain functional, but its timing should be adjusted to 1 day before the event.

## Scope
- In scope: 
  - Add `sendRsvpConfirmationEmail` and `sendEventUpdateEmail` functions to `src/lib/email-service.ts` with new HTML and plain-text templates.
  - Update `src/app/api/rsvp/route.ts` to trigger `sendRsvpConfirmationEmail` asynchronously after successfully saving a "Yes" RSVP.
  - Update the event update API route (e.g., `src/app/api/invitations/[id]/route.ts`) to detect changes to `event_date`, `event_time`, or `location`, and trigger `sendEventUpdateEmail` to all relevant guests.
  - Update the Vercel cron configuration and database query in `/api/cron/send-reminders/route.ts` to fetch events 1 day away instead of 2 days away.
  - Ensure the confirmation email includes standard "Add to Calendar" URLs (Google Calendar links and/or `.ics` attachment logic).
- Out of scope: 
  - Modifying the core architecture of the email sender (Resend) or changing the cron job hosting (Vercel).
  - Building a UI for hosts to manually draft and blast custom emails to guests.
  - Sending SMS notifications.

## UX & Entry Points
- Primary entry: 
  - Guest RSVP submission (Public link).
  - Host editing an event (Dashboard).
- Components to touch: 
  - `src/lib/email-service.ts`
  - `src/app/api/rsvp/route.ts`
  - `src/app/api/invitations/[id]/route.ts` (or equivalent update route)
  - `src/app/api/cron/send-reminders/route.ts`
- UX notes: Guests will experience a seamless flow. After clicking "Submit RSVP", they will see the standard UI success message, and shortly after, an email will arrive in their inbox. Hosts editing an event will see a standard success toast, while the background process notifies their guests.

## Tech Plan
- Data sources / utils: 
  - Extend `src/lib/email-service.ts` to reuse `Resend` logic but with new templates for `generateConfirmationEmailHTML` and `generateUpdateEmailHTML`.
  - Use `calendar-utils.ts` (to be implemented by the Add to Calendar ticket) or inline logic to generate Google Calendar URLs in the confirmation email HTML.
- Files to modify / add: 
  - `src/lib/email-service.ts` (Add new templates and send functions)
  - `src/app/api/rsvp/route.ts` (Call `sendRsvpConfirmationEmail` in the background)
  - `src/app/api/invitations/[id]/route.ts` (Query `rsvps` table where `response='yes'` and `email` is not null, then call `sendEventUpdateEmail`)
  - `src/app/api/cron/send-reminders/route.ts` (Change date calculation from +2/+3 days to +1 day)
- Risks / constraints: 
  - **API Response Times:** Sending emails synchronously during the RSVP API call could slow down the guest's UI experience. The Resend API call should be non-blocking (e.g., not strictly awaited before returning the 201 response, or handled quickly).
  - **Spam / Rate Limits:** When a host updates an event, the system might need to send dozens of emails at once. The code should process these in batches or use `Promise.allSettled` to avoid hitting Resend rate limits or failing the entire API request if one email fails.

## Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
actor Guest
actor Host
participant UI as Next.js App
participant API_RSVP as /api/rsvp
participant API_Update as /api/invitations/[id]
participant DB as Supabase DAL
participant Email as email-service.ts (Resend)

%% Flow 1: RSVP Confirmation
Guest->>UI: Submits RSVP "Yes" with email
UI->>API_RSVP: POST /api/rsvp
API_RSVP->>DB: Save RSVP to database
DB-->>API_RSVP: Success
API_RSVP->>Email: sendRsvpConfirmationEmail(guest, event)
Email-->>Guest: Sends Confirmation Email with Calendar Link
API_RSVP-->>UI: 201 Created

%% Flow 2: Event Update
Host->>UI: Updates Event Date/Time/Location
UI->>API_Update: PUT/PATCH /api/invitations/[id]
API_Update->>DB: Update Invitation Details
API_Update->>DB: Fetch RSVPs (response='yes', email!=null)
DB-->>API_Update: List of guests
API_Update->>Email: sendEventUpdateEmail(guests, newDetails)
Email-->>Guest: Sends "Event Updated" Email
API_Update-->>UI: 200 OK
```

## Acceptance Criteria
- [ ] Submitting a "Yes" RSVP with an email address immediately triggers a confirmation email to the guest.
- [ ] The confirmation email contains the event details and an option/link to add the event to their calendar.
- [ ] Updating an invitation's core details via the API triggers an "Event Updated" email to all guests who RSVP'd "Yes" and opted into emails.
- [ ] The daily cron job (`/api/cron/send-reminders`) correctly targets events that are 1 day away, instead of 2 days.
- [ ] Failed emails do not crash the primary RSVP or Update API routes.