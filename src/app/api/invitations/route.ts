import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// GET /api/invitations - Get user's invitations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      throw userError;
    }

    // Get invitations using the database layer
    const invitations = await supabaseDb.getInvitations(userData.id);

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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, event_date, event_time, location, design_id } = body;

    // Validate required fields
    if (!title || !event_date) {
      return NextResponse.json({ error: 'Title and event date are required' }, { status: 400 });
    }

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      throw userError;
    }

    // Create invitation using the database layer
    const shareToken = uuidv4();
    const invitation = await supabaseDb.createInvitation({
      user_id: userData.id,
      title,
      description,
      event_date,
      event_time,
      location,
      design_id: design_id || null,
      share_token: shareToken,
    }, userData.id);

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}