import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/database-supabase';
import { logger } from "@/lib/logger";

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

    // ⚡ Bolt Optimization: Add Cache-Control headers for public invites
    // Guests frequently reload the same invite page. Caching at the edge
    // for 60s (with stale-while-revalidate for 5m) drastically reduces DB load
    // and improves Time To First Byte (TTFB) without breaking dynamic RSVP updates.
    return NextResponse.json(
      { invitation },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/invite/[token]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
