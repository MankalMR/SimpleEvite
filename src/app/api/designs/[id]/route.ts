import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { supabaseAdmin } from '@/lib/supabase';

// PUT /api/designs/[id] - Update design
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
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

    // Update design using the database layer
    const design = await supabaseDb.updateDesign(resolvedParams.id, { name }, userData.id);

    if (!design) {
      return NextResponse.json({ error: 'Design not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ design });
  } catch (error) {
    console.error('Error in PUT /api/designs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/designs/[id] - Delete design
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      throw userError;
    }

    // First get the design to get the image URL for cleanup
    const design = await supabaseDb.getDesign(resolvedParams.id, userData.id);

    if (!design) {
      return NextResponse.json({ error: 'Design not found or unauthorized' }, { status: 404 });
    }

    // Delete the design using the database layer
    const success = await supabaseDb.deleteDesign(resolvedParams.id, userData.id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
    }

    // Extract file path from URL and delete from Supabase Storage
    if (design.image_url && design.image_url.includes('/storage/v1/object/public/designs/')) {
      const filePath = design.image_url.split('/storage/v1/object/public/designs/')[1];
      if (filePath && filePath.startsWith(userData.id + '/')) {
        await supabaseAdmin.storage
          .from('designs')
          .remove([filePath]);
      }
    }

    return NextResponse.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/designs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
