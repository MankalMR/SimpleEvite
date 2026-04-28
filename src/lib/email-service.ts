import { Resend } from 'resend';
import type { Invitation, RSVP } from '@/lib/supabase';
import { logger } from "@/lib/logger";
import { generateGoogleCalendarUrl } from './calendar-utils';
import { escapeHTML } from './security';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY || 'mock_key_for_build');

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.NOTIFICATION_SENDER_EMAIL || 'Simple Evite <onboarding@resend.dev>',
  senderName: process.env.NOTIFICATION_SENDER_NAME || 'Simple Evite',
  replyTo: process.env.NOTIFICATION_REPLY_TO_EMAIL,
};

export interface EmailReminderParams {
  to: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description?: string;
  inviteUrl: string;
  organizerName?: string;
}

export interface RsvpConfirmationParams {
  to: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description?: string;
  inviteUrl: string;
  organizerNotes?: string;
}

export interface EventUpdateParams {
  to: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description?: string;
  inviteUrl: string;
  organizerNotes?: string;
}




export interface HostRsvpNotificationParams {
  to: string;
  guestName: string;
  response: 'yes' | 'no' | 'maybe';
  comment?: string;
  eventTitle: string;
  inviteUrl: string;
}


/**
 * Send an event reminder email to a guest
 */
export async function sendEventReminderEmail(params: EmailReminderParams) {
  const {
    to,
    guestName,
    eventTitle,
    eventDate,
    eventTime,
    location,
    description,
    inviteUrl,
    organizerName,
  } = params;

  try {
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = generateReminderEmailHTML({
      guestName,
      eventTitle,
      eventDate: formattedDate,
      eventTime,
      location,
      description,
      inviteUrl,
      organizerName,
    });

    const text = generateReminderEmailText({
      guestName,
      eventTitle,
      eventDate: formattedDate,
      eventTime,
      location,
      description,
      inviteUrl,
    });

    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Reminder: ${eventTitle} is coming up soon! 🎉`,
      html,
      text,
      // Tags removed - not needed for basic email delivery
      // Tags are only useful for analytics/tracking in Resend dashboard
    });

    // Check if Resend returned an error (they don't throw, they return error in response)
    if (response.error) {
      logger.error({ err: response.error }, 'Resend API error:');
      return {
        success: false,
        error: response.error.message || 'Email sending failed',
        response: response,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
      response: response,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to send reminder email:');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate HTML email template for event reminder
 */
function generateReminderEmailHTML(params: {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description?: string;
  inviteUrl: string;
  organizerName?: string;
}): string {
  const {
    guestName,
    eventTitle,
    eventDate,
    eventTime,
    location,
    description,
    inviteUrl,
    organizerName,
  } = params;

  const safeGuestName = escapeHTML(guestName);
  const safeEventTitle = escapeHTML(eventTitle);
  const safeEventDate = escapeHTML(eventDate);
  const safeEventTime = escapeHTML(eventTime);
  const safeLocation = escapeHTML(location);
  const safeDescription = description ? escapeHTML(description) : undefined;
  const safeOrganizerName = organizerName ? escapeHTML(organizerName) : undefined;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Reminder</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      width: 60px;
      height: 60px;
      background-color: #ffffff;
      border-radius: 12px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #374151;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .event-card {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      border-left: 4px solid #3b82f6;
    }
    .event-title {
      font-size: 22px;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0 0 16px 0;
    }
    .event-detail {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
      color: #1f2937;
    }
    .event-detail-icon {
      margin-right: 12px;
      color: #3b82f6;
      font-size: 18px;
      min-width: 24px;
    }
    .event-detail-text {
      font-size: 15px;
      line-height: 1.5;
    }
    .description {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;
      font-style: italic;
    }
    .cta-button {
      display: inline-block;
      background-color: #3b82f6;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #2563eb;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
      line-height: 1.6;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .event-title {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">📧</div>
      <h1>Event Reminder</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hi ${safeGuestName},
      </div>

      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        This is a friendly reminder that the event you RSVP'd to is coming up in just 2 days! 🎉
      </p>

      <!-- Event Details Card -->
      <div class="event-card">
        <h2 class="event-title">${safeEventTitle}</h2>

        <div class="event-detail">
          <span class="event-detail-icon">📅</span>
          <span class="event-detail-text"><strong>When:</strong> ${safeEventDate} at ${safeEventTime}</span>
        </div>

        <div class="event-detail">
          <span class="event-detail-icon">📍</span>
          <span class="event-detail-text"><strong>Where:</strong> ${safeLocation}</span>
        </div>

        ${safeOrganizerName ? `
        <div class="event-detail">
          <span class="event-detail-icon">👤</span>
          <span class="event-detail-text"><strong>Hosted by:</strong> ${safeOrganizerName}</span>
        </div>
        ` : ''}
      </div>

      ${safeDescription ? `
      <div class="description">
        "${safeDescription}"
      </div>
      ` : ''}

      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 24px 0;">
        We're looking forward to seeing you there! Click the button below to view the full invitation details.
      </p>

      <div style="text-align: center;">
        <a href="${inviteUrl}" class="cta-button">
          View Full Invitation →
        </a>
      </div>

      <div class="divider"></div>

      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 16px 0;">
        <strong>Need to change your RSVP?</strong><br>
        Visit the <a href="${inviteUrl}" style="color: #3b82f6; text-decoration: none;">invitation page</a> to update your response.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        Sent with ❤️ by <strong>Simple Evite</strong>
      </p>
      <p style="margin: 8px 0;">
        Create your own beautiful invitations at <a href="https://evite.mankala.space">evite.mankala.space</a>
      </p>
      <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
        You received this email because you RSVP'd to this event and opted in to receive reminders.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email for event reminder (fallback)
 */
function generateReminderEmailText(params: {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description?: string;
  inviteUrl: string;
}): string {
  const {
    guestName,
    eventTitle,
    eventDate,
    eventTime,
    location,
    description,
    inviteUrl,
  } = params;

  return `
Hi ${guestName},

This is a friendly reminder that the event you RSVP'd to is coming up in just 2 days!

EVENT DETAILS
=============

${eventTitle}

When: ${eventDate} at ${eventTime}
Where: ${location}

${description ? `\n"${description}"\n` : ''}

We're looking forward to seeing you there!

View the full invitation: ${inviteUrl}

Need to change your RSVP? Visit the invitation page to update your response.

---
Sent with love by Simple Evite
Create your own invitations at https://evite.mankala.space

You received this email because you RSVP'd to this event and opted in to receive reminders.
  `.trim();
}

/**
 * Test email sending (useful for development)
 */
/**
 * Send an RSVP confirmation email to a guest
 */
export async function sendRsvpConfirmationEmail(params: RsvpConfirmationParams) {
  try {
    const {
      to,
      guestName,
      eventTitle,
      eventDate,
      eventTime,
      location,
      description,
      inviteUrl,
      organizerNotes,
    } = params;

    // Format date nicely if it's in YYYY-MM-DD format
    let formattedDate = eventDate;
    try {
      if (eventDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dateObj = new Date(eventDate);
        formattedDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch {
      // Ignore date parsing errors and use original string
    }

    const html = generateConfirmationEmailHTML({
      guestName,
      eventTitle,
      eventDate: formattedDate,
      eventTime,
      location,
      description,
      inviteUrl,
      organizerNotes,
      rawEventDate: eventDate, // pass the original YYYY-MM-DD for calendar links
    });

    const text = generateConfirmationEmailText({
      guestName,
      eventTitle,
      eventDate: formattedDate,
      eventTime,
      location,
      description,
      inviteUrl,
    });

    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `RSVP Confirmed: ${eventTitle} 🎉`,
      html,
      text,
    });

    if (response.error) {
      logger.error({ err: response.error }, 'Resend API error:');
      return {
        success: false,
        error: response.error.message || 'Email sending failed',
        response: response,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
      response: response,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to send RSVP confirmation email:');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send an event update email to a guest
 */
export async function sendEventUpdateEmail(params: EventUpdateParams) {
  try {
    const {
      to,
      guestName,
      eventTitle,
      eventDate,
      eventTime,
      location,
      description,
      inviteUrl,
      organizerNotes,
    } = params;

    // Format date nicely if it's in YYYY-MM-DD format
    let formattedDate = eventDate;
    try {
      if (eventDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dateObj = new Date(eventDate);
        formattedDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch {
      // Ignore date parsing errors and use original string
    }

    const html = generateUpdateEmailHTML({
      guestName,
      eventTitle,
      eventDate: formattedDate,
      eventTime,
      location,
      description,
      inviteUrl,
      organizerNotes,
      rawEventDate: eventDate, // pass the original YYYY-MM-DD for calendar links
    });

    const text = generateUpdateEmailText({
      guestName,
      eventTitle,
      eventDate: formattedDate,
      eventTime,
      location,
      description,
      inviteUrl,
    });

    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Event Updated: ${eventTitle}`,
      html,
      text,
    });

    if (response.error) {
      logger.error({ err: response.error }, 'Resend API error:');
      return {
        success: false,
        error: response.error.message || 'Email sending failed',
        response: response,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
      response: response,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to send event update email:');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate HTML email template for RSVP confirmation
 */
function generateConfirmationEmailHTML(params: {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description?: string;
  inviteUrl: string;
  organizerNotes?: string;
  rawEventDate: string;
}): string {
  const {
    guestName,
    eventTitle,
    eventDate,
    eventTime,
    location,
    description,
    inviteUrl,
    organizerNotes,
    rawEventDate,
  } = params;

  const safeGuestName = escapeHTML(guestName);
  const safeEventTitle = escapeHTML(eventTitle);
  const safeEventDate = escapeHTML(eventDate);
  const safeEventTime = escapeHTML(eventTime);
  const safeLocation = escapeHTML(location);
  const safeDescription = description ? escapeHTML(description) : undefined;
  const safeOrganizerNotes = organizerNotes ? escapeHTML(organizerNotes) : undefined;

  const googleCalendarUrl = generateGoogleCalendarUrl({
    title: eventTitle,
    event_date: rawEventDate,
    event_time: eventTime,
    location,
    description: description || '',
    organizer_notes: organizerNotes || '',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Confirmation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      width: 60px;
      height: 60px;
      background-color: #ffffff;
      border-radius: 12px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #374151;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .event-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      border-left: 4px solid #10b981;
    }
    .event-title {
      font-size: 22px;
      font-weight: 700;
      color: #065f46;
      margin: 0 0 16px 0;
    }
    .event-detail {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
      color: #1f2937;
    }
    .event-detail-icon {
      margin-right: 12px;
      color: #10b981;
      font-size: 18px;
      min-width: 24px;
    }
    .event-detail-text {
      font-size: 15px;
      line-height: 1.5;
    }
    .description {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;
      font-style: italic;
    }
    .cta-button {
      display: inline-block;
      background-color: #10b981;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #059669;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
      line-height: 1.6;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .event-title {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✅</div>
      <h1>RSVP Confirmed</h1>
    </div>

    <div class="content">
      <div class="greeting">
        Hi ${safeGuestName},
      </div>

      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        Thanks for RSVPing! Your response has been recorded. Here are the details for the upcoming event:
      </p>

      <div class="event-card">
        <h2 class="event-title">${safeEventTitle}</h2>

        <div class="event-detail">
          <span class="event-detail-icon">📅</span>
          <span class="event-detail-text"><strong>When:</strong> ${safeEventDate} at ${safeEventTime}</span>
        </div>

        <div class="event-detail">
          <span class="event-detail-icon">📍</span>
          <span class="event-detail-text"><strong>Where:</strong> ${safeLocation}</span>
        </div>
      </div>

      ${safeDescription ? `
      <div class="description">
        "${safeDescription}"
      </div>
      ` : ''}

      ${safeOrganizerNotes ? `
      <div class="description" style="margin-top: 16px; background-color: #ffffff; border-left: 3px solid #10b981; padding: 12px;">
        <h3 style="margin: 0 0 4px 0; color: #059669; font-size: 13px; font-weight: 600;">A note from the organizer:</h3>
        <p style="margin: 0; font-style: italic;">${safeOrganizerNotes}</p>
      </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="${googleCalendarUrl}" class="cta-button" style="background-color: #4285F4;">
          Add to Google Calendar 📅
        </a>
      </div>

      <div class="divider"></div>

      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 16px 0;">
        <strong>Need to change your RSVP?</strong><br>
        Visit the <a href="${inviteUrl}" style="color: #10b981; text-decoration: none;">invitation page</a> to update your response.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        Sent with ❤️ by <strong>Simple Evite</strong>
      </p>
      <p style="margin: 8px 0;">
        Create your own beautiful invitations at <a href="https://evite.mankala.space">evite.mankala.space</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email template for event updates
 */
function generateUpdateEmailHTML(params: {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description?: string;
  inviteUrl: string;
  organizerNotes?: string;
  rawEventDate: string;
}): string {
  const {
    guestName,
    eventTitle,
    eventDate,
    eventTime,
    location,
    description,
    inviteUrl,
    organizerNotes,
    rawEventDate,
  } = params;

  const safeGuestName = escapeHTML(guestName);
  const safeEventTitle = escapeHTML(eventTitle);
  const safeEventDate = escapeHTML(eventDate);
  const safeEventTime = escapeHTML(eventTime);
  const safeLocation = escapeHTML(location);
  const safeDescription = description ? escapeHTML(description) : undefined;
  const safeOrganizerNotes = organizerNotes ? escapeHTML(organizerNotes) : undefined;

  const googleCalendarUrl = generateGoogleCalendarUrl({
    title: eventTitle,
    event_date: rawEventDate,
    event_time: eventTime,
    location,
    description: description || '',
    organizer_notes: organizerNotes || '',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Updated</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      width: 60px;
      height: 60px;
      background-color: #ffffff;
      border-radius: 12px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #374151;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .event-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      border-left: 4px solid #f59e0b;
    }
    .event-title {
      font-size: 22px;
      font-weight: 700;
      color: #b45309;
      margin: 0 0 16px 0;
    }
    .event-detail {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
      color: #1f2937;
    }
    .event-detail-icon {
      margin-right: 12px;
      color: #f59e0b;
      font-size: 18px;
      min-width: 24px;
    }
    .event-detail-text {
      font-size: 15px;
      line-height: 1.5;
    }
    .description {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;
      font-style: italic;
    }
    .cta-button {
      display: inline-block;
      background-color: #f59e0b;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #d97706;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
      line-height: 1.6;
    }
    .footer a {
      color: #f59e0b;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .event-title {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚠️</div>
      <h1>Event Updated</h1>
    </div>

    <div class="content">
      <div class="greeting">
        Hi ${safeGuestName},
      </div>

      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        There has been an update to an event you RSVP'd to. Please review the new details below:
      </p>

      <div class="event-card">
        <h2 class="event-title">${safeEventTitle}</h2>

        <div class="event-detail">
          <span class="event-detail-icon">📅</span>
          <span class="event-detail-text"><strong>When:</strong> ${safeEventDate} at ${safeEventTime}</span>
        </div>

        <div class="event-detail">
          <span class="event-detail-icon">📍</span>
          <span class="event-detail-text"><strong>Where:</strong> ${safeLocation}</span>
        </div>
      </div>

      ${safeDescription ? `
      <div class="description">
        "${safeDescription}"
      </div>
      ` : ''}

      ${safeOrganizerNotes ? `
      <div class="description" style="margin-top: 16px; background-color: #ffffff; border-left: 3px solid #f59e0b; padding: 12px;">
        <h3 style="margin: 0 0 4px 0; color: #d97706; font-size: 13px; font-weight: 600;">A note from the organizer:</h3>
        <p style="margin: 0; font-style: italic;">${safeOrganizerNotes}</p>
      </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="${googleCalendarUrl}" class="cta-button" style="background-color: #4285F4;">
          Update Google Calendar 📅
        </a>
      </div>

      <div style="text-align: center; margin-top: 10px;">
        <a href="${inviteUrl}" class="cta-button">
          View Full Invitation →
        </a>
      </div>

      <div class="divider"></div>

      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 16px 0;">
        <strong>Need to change your RSVP?</strong><br>
        Visit the <a href="${inviteUrl}" style="color: #f59e0b; text-decoration: none;">invitation page</a> to update your response.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        Sent with ❤️ by <strong>Simple Evite</strong>
      </p>
      <p style="margin: 8px 0;">
        Create your own beautiful invitations at <a href="https://evite.mankala.space">evite.mankala.space</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email for RSVP confirmation
 */
function generateConfirmationEmailText(params: {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description?: string;
  inviteUrl: string;
}): string {
  const {
    guestName,
    eventTitle,
    eventDate,
    eventTime,
    location,
    description,
    inviteUrl,
  } = params;

  return `
Hi ${guestName},

Thanks for RSVPing! Your response has been recorded.

EVENT DETAILS
=============

${eventTitle}

When: ${eventDate} at ${eventTime}
Where: ${location}

${description ? `\n"${description}"\n` : ''}

View the full invitation: ${inviteUrl}

Need to change your RSVP? Visit the invitation page to update your response.

---
Sent with love by Simple Evite
Create your own invitations at https://evite.mankala.space
  `.trim();
}

/**
 * Generate plain text email for event updates
 */
function generateUpdateEmailText(params: {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description?: string;
  inviteUrl: string;
}): string {
  const {
    guestName,
    eventTitle,
    eventDate,
    eventTime,
    location,
    description,
    inviteUrl,
  } = params;

  return `
Hi ${guestName},

There has been an update to an event you RSVP'd to. Please review the new details below:

EVENT DETAILS
=============

${eventTitle}

When: ${eventDate} at ${eventTime}
Where: ${location}

${description ? `\n"${description}"\n` : ''}

View the full invitation: ${inviteUrl}

Need to change your RSVP? Visit the invitation page to update your response.

---
Sent with love by Simple Evite
Create your own invitations at https://evite.mankala.space
  `.trim();
}










/**
 * Generate HTML email template for host RSVP notification
 */
function generateHostNotificationEmailHTML(params: {
  guestName: string;
  response: string;
  comment?: string;
  eventTitle: string;
  inviteUrl: string;
}): string {
  const { guestName, response, comment, eventTitle, inviteUrl } = params;

  const safeGuestName = escapeHTML(guestName);
  const safeEventTitle = escapeHTML(eventTitle);
  const safeComment = comment ? escapeHTML(comment) : undefined;

  const responseColor = response === 'yes' ? '#10b981' : response === 'no' ? '#ef4444' : '#f59e0b';
  const responseEmoji = response === 'yes' ? '✅' : response === 'no' ? '❌' : '❓';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New RSVP: ${eventTitle}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; }
    .logo { width: 60px; height: 60px; background-color: #ffffff; border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; line-height: 1.6; }
    .rsvp-card { background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e5e7eb; }
    .response-badge { display: inline-block; padding: 6px 12px; border-radius: 9999px; color: #ffffff; font-weight: 600; font-size: 14px; text-transform: uppercase; background-color: ${responseColor}; margin-bottom: 16px; }
    .detail-row { margin-bottom: 12px; }
    .detail-label { font-weight: 600; color: #4b5563; display: block; margin-bottom: 4px; font-size: 14px; }
    .detail-value { color: #1f2937; font-size: 16px; }
    .comment-box { background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 16px; font-style: italic; color: #4b5563; }
    .cta-button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; text-align: center; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; line-height: 1.6; }
    .footer a { color: #4f46e5; text-decoration: none; }
    .divider { height: 1px; background-color: #e5e7eb; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📫</div>
      <h1>New RSVP Received</h1>
    </div>

    <div class="content">
      <div class="greeting">
        Hi there,
      </div>

      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        You have a new response for your event <strong>${safeEventTitle}</strong>.
      </p>

      <div class="rsvp-card">
        <div class="response-badge">${responseEmoji} ${response}</div>

        <div class="detail-row">
          <span class="detail-label">Guest Name</span>
          <span class="detail-value"><strong>${safeGuestName}</strong></span>
        </div>

        ${safeComment ? `
        <div class="detail-row" style="margin-top: 20px;">
          <span class="detail-label">Message</span>
          <div class="comment-box">"${safeComment}"</div>
        </div>
        ` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${inviteUrl}" class="cta-button">
          View Event Dashboard
        </a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        Sent with ❤️ by <strong>Simple Evite</strong>
      </p>
      <p style="margin: 8px 0;">
        Create your own beautiful invitations at <a href="https://evite.mankala.space">evite.mankala.space</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email for host RSVP notification
 */
function generateHostNotificationEmailText(params: {
  guestName: string;
  response: string;
  comment?: string;
  eventTitle: string;
  inviteUrl: string;
}): string {
  const { guestName, response, comment, eventTitle, inviteUrl } = params;

  return `
Hi there,

You have a new response for your event "${eventTitle}".

Guest: ${guestName}
Response: ${response.toUpperCase()}
${comment ? `
Message: "${comment}"
` : ''}

View your event dashboard: ${inviteUrl}

---
Sent with love by Simple Evite
Create your own invitations at https://evite.mankala.space
  `.trim();
}


export async function sendTestEmail(to: string) {
  try {
    const res = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject: 'Test Email from Simple Evite',
      html: '<p>This is a test email. If you received this, Resend is configured correctly!</p>',
    });

    // The Resend SDK resolves with an error object rather than throwing on API failures
    if (res.error) {
      logger.error({ err: res.error }, 'Resend API error during test email:');
      return {
        success: false,
        error: res.error.message || 'Email sending failed',
        response: res,
      };
    }

    return { success: true, response: res };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}


/**
 * Send an email notification to the host about a new RSVP
 */
export async function sendHostRsvpNotificationEmail(params: HostRsvpNotificationParams) {
  try {
    const html = generateHostNotificationEmailHTML(params);
    const text = generateHostNotificationEmailText(params);

    const res = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: params.to,
      subject: `New RSVP: ${params.guestName} responded ${params.response.toUpperCase()}`,
      html,
      text,
    });

    if (res.error) {
      logger.error({ err: res.error }, 'Resend API error during host RSVP notification:');
      return { success: false, error: res.error.message || 'Email sending failed' };
    }

    return { success: true, id: res.data?.id };
  } catch (err) {
    logger.error({ err }, 'Unhandled error sending host RSVP notification email:');
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}


/**
 * Prepare reminder data from RSVP and Invitation
 */
export function prepareReminderData(
  rsvp: RSVP & { invitations?: Partial<Invitation> },
  invitation: Invitation,
  organizerName?: string
): EmailReminderParams | null {
  // Only send to guests who RSVP'd "yes" and provided email
  if (rsvp.response !== 'yes' || !rsvp.email) {
    return null;
  }

  // Check if email notifications are enabled
  if (rsvp.notification_preferences?.email === false) {
    return null;
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://evite.mankala.space'}/invite/${invitation.share_token}`;

  return {
    to: rsvp.email,
    guestName: rsvp.name,
    eventTitle: invitation.title,
    eventDate: invitation.event_date,
    eventTime: invitation.event_time,
    location: invitation.location,
    description: invitation.description,
    inviteUrl,
    organizerName,
  };
}


