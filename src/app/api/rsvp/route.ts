import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/rsvp - Create RSVP (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitation_id, name, response, comment } = body;

    // Validate required fields
    if (!invitation_id || !name || !response) {
      return NextResponse.json({ error: 'Invitation ID, name, and response are required' }, { status: 400 });
    }

    // Validate response value
    if (!['yes', 'no', 'maybe'].includes(response)) {
      return NextResponse.json({ error: 'Response must be yes, no, or maybe' }, { status: 400 });
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

    // Create RSVP
    const { data: rsvp, error } = await supabase
      .from('rsvps')
      .insert({
        invitation_id,
        name: name.trim(),
        response,
        comment: comment?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating RSVP:', error);
      return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 });
    }

    return NextResponse.json({ rsvp }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/rsvp:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
