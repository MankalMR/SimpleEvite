import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/designs - Get user's designs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: designs, error } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching designs:', error);
      return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
    }

    return NextResponse.json({ designs });
  } catch (error) {
    console.error('Error in GET /api/designs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/designs - Create new design
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image_url } = body;

    // Validate required fields
    if (!name || !image_url) {
      return NextResponse.json({ error: 'Name and image URL are required' }, { status: 400 });
    }

    const { data: design, error } = await supabase
      .from('designs')
      .insert({
        user_id: session.user.id,
        name,
        image_url,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating design:', error);
      return NextResponse.json({ error: 'Failed to create design' }, { status: 500 });
    }

    return NextResponse.json({ design }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/designs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
