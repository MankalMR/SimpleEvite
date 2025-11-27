import { Resend } from 'resend';
import { Invitation, RSVP } from '@/lib/supabase';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

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
      console.error('Resend API error:', response.error);
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
    console.error('Failed to send reminder email:', error);
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
        Hi ${guestName},
      </div>

      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        This is a friendly reminder that the event you RSVP'd to is coming up in just 2 days! 🎉
      </p>

      <!-- Event Details Card -->
      <div class="event-card">
        <h2 class="event-title">${eventTitle}</h2>

        <div class="event-detail">
          <span class="event-detail-icon">📅</span>
          <span class="event-detail-text"><strong>When:</strong> ${eventDate} at ${eventTime}</span>
        </div>

        <div class="event-detail">
          <span class="event-detail-icon">📍</span>
          <span class="event-detail-text"><strong>Where:</strong> ${location}</span>
        </div>

        ${organizerName ? `
        <div class="event-detail">
          <span class="event-detail-icon">👤</span>
          <span class="event-detail-text"><strong>Hosted by:</strong> ${organizerName}</span>
        </div>
        ` : ''}
      </div>

      ${description ? `
      <div class="description">
        "${description}"
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
export async function sendTestEmail(to: string) {
  try {
    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject: 'Test Email from Simple Evite',
      html: '<p>This is a test email. If you received this, Resend is configured correctly!</p>',
    });

    return { success: true, response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
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


