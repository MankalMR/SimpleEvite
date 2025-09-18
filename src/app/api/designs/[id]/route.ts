import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// PUT /api/designs/[id] - Update design
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
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: design, error } = await supabase
      .from('designs')
      .update({ name })
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error || !design) {
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First get the design to get the image URL for cleanup
    const { data: design } = await supabase
      .from('designs')
      .select('image_url')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (!design) {
      return NextResponse.json({ error: 'Design not found or unauthorized' }, { status: 404 });
    }

    // Delete the design from database
    const { error } = await supabase
      .from('designs')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting design:', error);
      return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
    }

    // Extract file path from URL and delete from Supabase Storage
    if (design.image_url && design.image_url.includes('/storage/v1/object/public/designs/')) {
      const filePath = design.image_url.split('/storage/v1/object/public/designs/')[1];
      if (filePath && filePath.startsWith(session.user.id + '/')) {
        await supabase.storage
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
