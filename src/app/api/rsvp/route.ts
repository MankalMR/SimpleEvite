import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

        const { name, response, comment } = validation.data!;
        const body = await req.json();
        const { invitation_id } = body;

        // Validate invitation_id separately as it's not in the RSVP data validation
        if (!invitation_id || typeof invitation_id !== 'string') {
          return NextResponse.json({ error: 'Valid invitation ID is required' }, { status: 400 });
        }

        // Check if invitation exists
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id')
          .eq('id', invitation_id)
          .single();

        if (invitationError || !invitation) {
          return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
        }

        // Create RSVP with sanitized data
        const { data: rsvp, error } = await supabase
          .from('rsvps')
          .insert({
            invitation_id,
            name,
            response,
            comment: comment || null,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating RSVP:', error);
          const clientIP = req.headers.get('x-forwarded-for') ||
                          req.headers.get('x-real-ip') ||
                          'unknown';
          logSecurityEvent('rsvp_creation_failed', {
            invitation_id,
            error: error.message,
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
