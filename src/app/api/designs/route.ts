import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeText } from '@/lib/security';
import { logger } from "@/lib/logger";

// GET /api/designs - Get user's designs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as { id?: string })?.id;

    // Fallback: If session exists but id is missing, try to find user by email
    if (!userId && session?.user?.email) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single();
      
      if (userData) {
        userId = userData.id;
        logger.info({ userId }, 'Recovered userId from database via email fallback');
      }
    }

    if (!userId) {
      logger.warn({ session: !!session, email: session?.user?.email }, 'Unauthorized access attempt to /api/designs');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get designs using the database layer
    const designs = await supabaseDb.getDesigns(userId);

    return NextResponse.json({ designs });
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/designs:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/designs - Create new design
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as { id?: string })?.id;

    // Fallback: If session exists but id is missing, try to find user by email
    if (!userId && session?.user?.email) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single();
      
      if (userData) {
        userId = userData.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image_url } = body;

    // Validate required fields
    if (!name || !image_url) {
      return NextResponse.json({ error: 'Name and image URL are required' }, { status: 400 });
    }

    const sanitizedName = sanitizeText(name);

    // Create design using the database layer
    const design = await supabaseDb.createDesign({
      user_id: userId,
      name: sanitizedName,
      image_url,
    }, userId);

    return NextResponse.json({ design }, { status: 201 });
  } catch (error) {
    logger.error({ error }, 'Error in POST /api/designs:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
