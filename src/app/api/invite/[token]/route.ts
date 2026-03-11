import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/database-supabase';

// GET /api/invite/[token] - Get invitation by share token (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;

    // Use the unified database service
    const invitation = await supabaseDb.getInvitationByToken(resolvedParams.token);

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // ⚡ Bolt: Added Cache-Control to reduce DB load and improve TTFB for public invites
    return NextResponse.json(
      { invitation },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/invite/[token]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
