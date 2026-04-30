import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { logger } from "@/lib/logger";

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

    // Use DAL to verify ownership and delete RSVP
    const success = await supabaseDb.deleteRSVPWithOwnerCheck(resolvedParams.id, userId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'RSVP not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'RSVP deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error in DELETE /api/rsvp/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
