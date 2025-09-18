import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// GET /api/invitations - Get user's invitations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        designs (
          id,
          name,
          image_url
        ),
        rsvps (
          id,
          response
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
    }

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error in GET /api/invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invitations - Create new invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, event_date, event_time, location, design_id } = body;

    // Validate required fields
    if (!title || !event_date) {
      return NextResponse.json({ error: 'Title and event date are required' }, { status: 400 });
    }

    const shareToken = uuidv4();

    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        user_id: session.user.id,
        title,
        description,
        event_date,
        event_time,
        location,
        design_id: design_id || null,
        share_token: shareToken,
      })
      .select(`
        *,
        designs (
          id,
          name,
          image_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
