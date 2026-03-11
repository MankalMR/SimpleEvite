import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/database-supabase';
import { withSecurity, validateRequestBody, addSecurityHeaders, RATE_LIMIT_PRESETS, logSecurityEvent } from '@/lib/api-security';
import { validateRSVPData } from '@/lib/security';

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
        const invitationExists = await supabaseDb.checkInvitationExists(invitation_id);

        if (!invitationExists) {
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
        let createError;
        try {
          rsvp = await supabaseDb.createRSVP({
            invitation_id,
            name,
            response: response as 'yes' | 'no' | 'maybe',
            comment: comment || undefined,
            email: sanitizedEmail || undefined,
            notification_preferences: sanitizedNotificationPrefs,
            reminder_status: sanitizedEmail && response === 'yes' && sanitizedNotificationPrefs.email ? 'pending' : 'skipped',
          }, invitation_id);
        } catch (e) {
          createError = e;
        }

        if (createError) {
          console.error('Error creating RSVP:', createError);
          const clientIP = req.headers.get('x-forwarded-for') ||
                          req.headers.get('x-real-ip') ||
                          'unknown';
          logSecurityEvent('rsvp_creation_failed', {
            invitation_id,
            error: createError instanceof Error ? createError.message : String(createError),
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

        const apiResponse = NextResponse.json({ rsvp }, { status: 201 });
        return addSecurityHeaders(apiResponse);
      } catch (error) {
        console.error('Error in POST /api/rsvp:', error);
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
