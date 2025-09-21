import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE /api/rsvp/[id] - Delete RSVP (only invitation owner can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error('User lookup failed:', userError, 'Email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // First check if the user owns the invitation this RSVP belongs to
    const { data: rsvp, error: rsvpError } = await supabaseAdmin
      .from('rsvps')
      .select(`
        id,
        invitations!inner(
          user_id
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (rsvpError || !rsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    // Check if the current user owns the invitation
    const invitation = rsvp.invitations as unknown as { user_id: string };

    if (!invitation || invitation.user_id !== userData.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the RSVP
    const { error } = await supabaseAdmin
      .from('rsvps')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      console.error('Error deleting RSVP:', error);
      return NextResponse.json({ error: 'Failed to delete RSVP' }, { status: 500 });
    }

    return NextResponse.json({ message: 'RSVP deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/rsvp/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
