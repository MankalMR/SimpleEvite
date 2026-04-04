/**
 * POST /api/demo/rsvp — Submit an RSVP in demo mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoGuard } from '@/lib/demo/demo-guards';
import { RSVP } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { state } = guard;

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { invitation_id, name, response, comment } = body;

    if (!invitation_id || !name || !response) {
        return NextResponse.json({ error: 'invitation_id, name, and response are required' }, { status: 400 });
    }

    if (!['yes', 'no', 'maybe'].includes(response)) {
        return NextResponse.json({ error: 'response must be yes, no, or maybe' }, { status: 400 });
    }

    // Find the invitation
    const invitation = state.invitationsMap.get(invitation_id);
    if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const newRSVP: RSVP = {
        id: crypto.randomUUID(),
        invitation_id,
        name,
        response: response as 'yes' | 'no' | 'maybe',
        comment: comment || undefined,
        created_at: new Date().toISOString(),
    };

    // Add RSVP to the invitation's rsvps array
    if (!invitation.rsvps) {
        invitation.rsvps = [];
    }
    invitation.rsvps.push(newRSVP);

    return NextResponse.json({ rsvp: newRSVP }, { status: 201 });
}
