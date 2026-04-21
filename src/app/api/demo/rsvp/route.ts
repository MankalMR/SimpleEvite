/**
 * POST /api/demo/rsvp — Submit an RSVP in demo mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoGuard } from '@/lib/demo/demo-guards';
import { RSVP } from '@/lib/supabase';
import { validateRSVPData } from '@/lib/security';

export async function POST(request: NextRequest) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { state } = guard;

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { invitation_id } = body;

    if (!invitation_id) {
        return NextResponse.json({ error: 'invitation_id is required' }, { status: 400 });
    }

    const validation = validateRSVPData(body);
    if (!validation.isValid) {
        return NextResponse.json({ error: 'Invalid input', details: validation.errors }, { status: 400 });
    }

    const { name, response, comment, guest_count } = validation.sanitizedData!;


    // Find the invitation
    const invitation = state.invitationsMap.get(invitation_id);
    if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if RSVP deadline has passed
    if (invitation.rsvp_deadline) {
        const deadlineDate = new Date(invitation.rsvp_deadline);
        const currentDate = new Date();
        // Reset time components for accurate date comparison
        deadlineDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        if (currentDate > deadlineDate) {
            return NextResponse.json({ error: 'RSVPs are closed for this event' }, { status: 400 });
        }
    }


    const newRSVP: RSVP = {
        id: crypto.randomUUID(),
        invitation_id,
        name,
        response: response as 'yes' | 'no' | 'maybe',
        comment: comment || undefined,
        guest_count: guest_count,
        created_at: new Date().toISOString(),
    };

    // Add RSVP to the invitation's rsvps array
    if (!invitation.rsvps) {
        invitation.rsvps = [];
    }
    invitation.rsvps.push(newRSVP);

    return NextResponse.json({ rsvp: newRSVP }, { status: 201 });
}
