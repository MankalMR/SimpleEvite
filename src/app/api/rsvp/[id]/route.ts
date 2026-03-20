import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from "@/lib/logger";

interface RSVPWithInvitationOwner {
  id: string;
  // Supabase may return joined results as a single object or an array depending on configuration
  invitations: {
    user_id: string;
  } | Array<{ user_id: string }> | null;
}

// DELETE /api/rsvp/[id] - Delete RSVP (only invitation owner can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

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
      .returns<RSVPWithInvitationOwner>()
      .single();

    if (rsvpError || !rsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    // Check if the current user owns the invitation
    const invitation = Array.isArray(rsvp.invitations) ? rsvp.invitations[0] : rsvp.invitations;
    if (!invitation || invitation.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized. You do not own the invitation for this RSVP.' },
        { status: 403 }
      );
    }

    // Delete the RSVP
    const { error } = await supabaseAdmin
      .from('rsvps')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      logger.error({ error }, 'Error deleting RSVP:');
      return NextResponse.json({ error: 'Failed to delete RSVP' }, { status: 500 });
    }

    return NextResponse.json({ message: 'RSVP deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error in DELETE /api/rsvp/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
