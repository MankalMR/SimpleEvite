import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseDb } from '@/lib/database-supabase';
import { withSecurity, validateRequestBody, addSecurityHeaders, RATE_LIMIT_PRESETS, logSecurityEvent } from '@/lib/api-security';
import { validateRSVPData } from '@/lib/security';
import { logger } from "@/lib/logger";
import { sendRsvpConfirmationEmail } from '@/lib/email-service';

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

        // Get all data from validation result (body already parsed by validateRequestBody)
        const body = validation.rawData as Record<string, unknown>;
        const { name, response, comment } = validation.data!;
        const { invitation_id, email, notification_preferences } = body;

        // Validate invitation_id separately as it's not in the RSVP data validation
        if (!invitation_id || typeof invitation_id !== 'string') {
          return NextResponse.json({ error: 'Valid invitation ID is required' }, { status: 400 });
        }

        // Check if invitation exists
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id, title, event_date, event_time, location, description, organizer_notes, share_token')
          .eq('id', invitation_id)
          .single();

        if (invitationError || !invitation) {
          return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
        }

        // Validate email if provided
        let sanitizedEmail = undefined;
        if (email && typeof email === 'string') {
          const emailTrimmed = email.trim();
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(emailTrimmed)) {
            sanitizedEmail = emailTrimmed;
          }
        }

        // Validate notification preferences
        const sanitizedNotificationPrefs = notification_preferences && typeof notification_preferences === 'object'
          ? { email: (notification_preferences as { email?: boolean }).email === true }
          : { email: true };

        // Create RSVP with sanitized data
        let rsvp;
        try {
          rsvp = await supabaseDb.createRSVP({
            name,
            response: response as 'yes' | 'no' | 'maybe',
            comment: comment || undefined,
            email: sanitizedEmail || undefined,
            notification_preferences: sanitizedNotificationPrefs,
            reminder_status: sanitizedEmail && response === 'yes' && sanitizedNotificationPrefs.email ? 'pending' : 'skipped',
          }, invitation_id as string);
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

        // Send RSVP confirmation email
        if (response === 'yes' && sanitizedEmail) {
          const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://evite.mankala.space'}/invite/${invitation.share_token}`;

          await sendRsvpConfirmationEmail({
            to: sanitizedEmail,
            guestName: name,
            eventTitle: invitation.title,
            eventDate: invitation.event_date,
            eventTime: invitation.event_time,
            location: invitation.location,
            description: invitation.description || undefined,
            inviteUrl,
            organizerNotes: invitation.organizer_notes || undefined,
          });
        }

        const apiResponse = NextResponse.json({ rsvp }, { status: 201 });
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
