import { NextRequest, NextResponse } from 'next/server';

import { supabaseDb } from '@/lib/database-supabase';
import { withSecurity, validateRequestBody, addSecurityHeaders, RATE_LIMIT_PRESETS, logSecurityEvent } from '@/lib/api-security';
import { validateRSVPData } from '@/lib/security';
import { logger } from "@/lib/logger";
import { sendRsvpConfirmationEmail, sendHostRsvpNotificationEmail } from '@/lib/email-service';
import { isDateInPast } from '@/lib/date-utils';

// POST /api/rsvp - Create RSVP (public endpoint)
export async function POST(request: NextRequest) {
  return withSecurity(
    request,
    async (req) => {
      try {
        // Validate and sanitize request body
        const validation = await validateRequestBody(req, validateRSVPData);

        if (!validation.success) {
          const clientIP = req.headers.get('x-forwarded-for') ||
                          req.headers.get('x-real-ip') ||
                          'unknown';
          logSecurityEvent('invalid_rsvp_submission', {
            errors: validation.errors,
            ip: clientIP,
          });
          return NextResponse.json({
            error: 'Invalid input',
            details: validation.errors
          }, { status: 400 });
        }

        // Get all data from validation result
        const body = validation.rawData as Record<string, unknown>;
        const { name, response, comment, guest_count, email } = validation.data!;
        const { invitation_id, share_token, notification_preferences } = body;

        // Validate invitation_id separately as it's not in the RSVP data validation
        if (!invitation_id || typeof invitation_id !== 'string') {
          return NextResponse.json({ error: 'Valid invitation ID is required' }, { status: 400 });
        }

        // Validate share_token to ensure caller has link-based access
        if (!share_token || typeof share_token !== 'string') {
          return NextResponse.json({ error: 'Valid share token is required' }, { status: 401 });
        }

        // Check if invitation exists and matches the share_token via DAL
        const invitation = await supabaseDb.getInvitationByToken(share_token);

        if (!invitation || invitation.id !== invitation_id) {
          return NextResponse.json({ error: 'Invitation not found or invalid share token' }, { status: 404 });
        }

        // Check if RSVP deadline has passed
        if (invitation.rsvp_deadline && isDateInPast(invitation.rsvp_deadline)) {
          return NextResponse.json({ error: 'RSVPs are closed for this event' }, { status: 400 });
        }

        // Fetch host email for notification
        let hostEmail = undefined;
        if (invitation.user_id) {
          try {
            const email = await supabaseDb.getUserEmail(invitation.user_id);
            if (email) {
              hostEmail = email;
            }
          } catch (e) {
            logger.warn({ error: e }, 'Failed to fetch host email for RSVP notification');
          }
        }

        // Email is already validated by validateRSVPData
        const sanitizedEmail = email;

        // Validate notification preferences
        const sanitizedNotificationPrefs = notification_preferences && typeof notification_preferences === 'object'
          ? { email: (notification_preferences as { email?: boolean }).email === true }
          : { email: true };

        // Create or update RSVP with sanitized data
        let rsvp;
        let isUpdate = false;
        try {
          const result = await supabaseDb.upsertRSVP({
            name,
            response: response as 'yes' | 'no' | 'maybe',
            comment: comment || undefined,
            guest_count: guest_count,
            email: sanitizedEmail || undefined,
            notification_preferences: sanitizedNotificationPrefs,
            reminder_status: sanitizedEmail && response === 'yes' && sanitizedNotificationPrefs.email ? 'pending' : 'skipped',
          }, invitation_id as string);
          rsvp = result.rsvp;
          isUpdate = result.isUpdate;
        } catch (error) {
          logger.error({ error }, 'Error creating RSVP:');
          const clientIP = req.headers.get('x-forwarded-for') ||
                          req.headers.get('x-real-ip') ||
                          'unknown';
          logSecurityEvent('rsvp_creation_failed', {
            invitation_id,
            error: error instanceof Error ? error.message : 'Unknown error',
            ip: clientIP,
          });
          return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 });
        }

        const clientIP = req.headers.get('x-forwarded-for') ||
                        req.headers.get('x-real-ip') ||
                        'unknown';
        logSecurityEvent('rsvp_created', {
          invitation_id,
          response,
          ip: clientIP,
        }, 'low');

        // Send emails concurrently
        const emailPromises = [];

        // Send RSVP confirmation email
        if (response === 'yes' && sanitizedEmail) {
          const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://evite.mankala.space'}/invite/${invitation.share_token}`;

          emailPromises.push(
            sendRsvpConfirmationEmail({
              to: sanitizedEmail,
              guestName: name,
              eventTitle: invitation.title,
              eventDate: invitation.event_date,
              eventTime: invitation.event_time,
              location: invitation.location,
              description: invitation.description || undefined,
              inviteUrl,
              organizerNotes: invitation.organizer_notes || undefined,
            })
          );
        }

        // Send host notification email
        if (hostEmail) {
          const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://evite.mankala.space'}/dashboard/events/${invitation.id}`;

          emailPromises.push(
            sendHostRsvpNotificationEmail({
              to: hostEmail,
              guestName: name,
              response: response as 'yes' | 'no' | 'maybe',
              comment: comment || undefined,
              eventTitle: invitation.title,
              inviteUrl: dashboardUrl,
            }).catch(e => {
              logger.error({ error: e }, 'Failed to send host RSVP notification email');
            })
          );
        }

        // Await all email dispatches before responding to ensure they complete in serverless environment
        if (emailPromises.length > 0) {
          await Promise.allSettled(emailPromises);
        }

        const apiResponse = NextResponse.json({ rsvp, isUpdate }, { status: isUpdate ? 200 : 201 });
        return addSecurityHeaders(apiResponse);
      } catch (error) {
        logger.error({ error }, 'Error in POST /api/rsvp:');
        const clientIP = req.headers.get('x-forwarded-for') ||
                        req.headers.get('x-real-ip') ||
                        'unknown';
        logSecurityEvent('rsvp_api_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          ip: clientIP,
        }, 'high');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    },
    {
      requireAuth: false,
      rateLimit: RATE_LIMIT_PRESETS.RSVP,
      allowedMethods: ['POST'],
    }
  );
}
