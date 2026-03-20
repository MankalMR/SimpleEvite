import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const publicUrl = await supabaseDb.uploadDesignImage(fileName, buffer, file.type);

    if (!publicUrl) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Create design record in database
    const designName = name || file.name.replace(/\.[^/.]+$/, '');

    try {
      const design = await supabaseDb.createDesign({
        user_id: userId,
        name: designName,
        image_url: publicUrl,
      }, userId);

      return NextResponse.json({ design }, { status: 201 });
    } catch (dbError) {
      logger.error({ dbError }, 'Database error:');

      // Clean up uploaded file if database insert fails
      await supabaseDb.removeDesignImage(fileName);

      return NextResponse.json({ error: 'Failed to save design' }, { status: 500 });
    }
  } catch (error) {
    logger.error({ error }, 'Error in POST /api/upload:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
