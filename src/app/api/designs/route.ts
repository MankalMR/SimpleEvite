import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/designs - Get user's designs
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
      // If user doesn't exist yet, return empty designs array
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ designs: [] });
      }
      throw userError;
    }

    // Get designs using the database layer
    const designs = await supabaseDb.getDesigns(userData.id);

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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image_url } = body;

    // Validate required fields
    if (!name || !image_url) {
      return NextResponse.json({ error: 'Name and image URL are required' }, { status: 400 });
    }

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      // If user doesn't exist yet, this shouldn't happen in POST, but handle gracefully
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found. Please sign in again.' }, { status: 404 });
      }
      throw userError;
    }

    // Create design using the database layer
    const design = await supabaseDb.createDesign({
      user_id: userData.id,
      name,
      image_url,
    }, userData.id);

    return NextResponse.json({ design }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/designs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
