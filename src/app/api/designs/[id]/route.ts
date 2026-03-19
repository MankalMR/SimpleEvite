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
      try {
        const rawFilePath = design.image_url.split('/storage/v1/object/public/designs/')[1];
        if (rawFilePath) {
          const filePath = decodeURIComponent(rawFilePath);
          // Prevent directory traversal by strictly validating the path structure: userId/filename
          const pathParts = filePath.split('/');
          if (pathParts.length === 2 && pathParts[0] === userId && !pathParts[1].includes('..')) {
            await supabaseDb.removeDesignImage(filePath);
          } else {
            logger.warn({ filePath, userId }, 'Suspicious file deletion attempt blocked');
          }
        }
      } catch (e) {
        logger.error({ e }, 'Error parsing design image URL for deletion:');
      }
    }

    return NextResponse.json({ message: 'Design deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error in DELETE /api/designs/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
