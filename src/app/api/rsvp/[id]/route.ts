import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// DELETE /api/rsvp/[id] - Delete RSVP (only invitation owner can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    // First check if the user owns the invitation this RSVP belongs to
    const { data: rsvp, error: rsvpError } = await supabase
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
    const invitations = rsvp.invitations as { user_id: string }[];
    if (!invitations || invitations.length === 0 || invitations[0].user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the RSVP
    const { error } = await supabase
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
