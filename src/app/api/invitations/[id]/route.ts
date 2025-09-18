import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/invitations/[id] - Get invitation by ID (for owner)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: invitation, error } = await supabase
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
          name,
          response,
          comment,
          created_at
        )
      `)
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (error || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error in GET /api/invitations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/invitations/[id] - Update invitation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: invitation, error } = await supabase
      .from('invitations')
      .update({
        title,
        description,
        event_date,
        event_time,
        location,
        design_id: design_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select(`
        *,
        designs (
          id,
          name,
          image_url
        )
      `)
      .single();

    if (error || !invitation) {
      return NextResponse.json({ error: 'Invitation not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error in PUT /api/invitations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/invitations/[id] - Delete invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting invitation:', error);
      return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/invitations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
