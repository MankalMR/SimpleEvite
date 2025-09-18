import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/invite/[token] - Get invitation by share token (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select(`
        id,
        title,
        description,
        event_date,
        event_time,
        location,
        created_at,
        design_id,
        designs!design_id (
          id,
          name,
          image_url
        ),
        rsvps (
          id,
          name,
          response,
          comment,
          created_at
        )
      `)
      .eq('share_token', params.token)
      .single();

    if (error || !invitation) {
      console.error('Error fetching invitation:', error);
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Debug log to see the data structure
    console.log('Fetched invitation:', JSON.stringify(invitation, null, 2));

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error in GET /api/invite/[token]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
