import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { logger } from "@/lib/logger";

// PUT /api/designs/[id] - Update design
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Update design using the database layer
    const design = await supabaseDb.updateDesign(resolvedParams.id, { name }, userId);

    if (!design) {
      return NextResponse.json({ error: 'Design not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ design });
  } catch (error) {
    logger.error({ error }, 'Error in PUT /api/designs/[id]:');
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
    const userId = (session?.user as { id?: string })?.id;

    if (!userId || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    // First get the design to get the image URL for cleanup
    const design = await supabaseDb.getDesign(resolvedParams.id, userId);

    if (!design) {
      return NextResponse.json({ error: 'Design not found or unauthorized' }, { status: 404 });
    }

    // Delete the design using the database layer
    const success = await supabaseDb.deleteDesign(resolvedParams.id, userId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
    }

    // Extract file path from URL and delete from Supabase Storage
    if (design.image_url && design.image_url.includes('/storage/v1/object/public/designs/')) {
      const rawFilePath = design.image_url.split('/storage/v1/object/public/designs/')[1];
      if (rawFilePath) {
        try {
          const filePath = decodeURIComponent(rawFilePath);
          const pathParts = filePath.split('/');

          // Strict validation: must be exactly userId/filename and no directory traversal
          if (
            pathParts.length === 2 &&
            pathParts[0] === userId &&
            !filePath.includes('..')
          ) {
            await supabaseDb.deleteDesignImage(filePath);
          } else {
            logger.warn({ userId, filePath }, 'Attempted path traversal or invalid file path in design deletion');
          }
        } catch (decodeError) {
          logger.warn({ userId, rawFilePath, error: decodeError }, 'Malformed URI in design image URL during deletion');
        }
      }
    }

    return NextResponse.json({ message: 'Design deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error in DELETE /api/designs/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
