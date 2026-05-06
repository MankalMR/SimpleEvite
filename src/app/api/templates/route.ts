import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/database-supabase';
import { logger } from "@/lib/logger";

// GET /api/templates - Get all active templates with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const occasion = searchParams.get('occasion');
    const theme = searchParams.get('theme');

    const templates = await supabaseDb.getTemplates({
      occasion: occasion || undefined,
      theme: theme || undefined
    });

    // ⚡ Bolt: Added Cache-Control to reduce DB load and improve TTFB for template selector
    return NextResponse.json(
      { templates: templates },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/templates:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/templates - Create new template (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an admin
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      logger.warn({ email: session.user.email }, 'Unauthorized template creation attempt by non-admin');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      occasion,
      theme,
      image_url,
      thumbnail_url,
      description,
      tags,
      sort_order
    } = body;

    // Validate required fields
    if (!name || !occasion || !theme || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields: name, occasion, theme, image_url' },
        { status: 400 }
      );
    }

    // Validate occasion and theme values
    const validOccasions = ['birthday', 'christmas', 'new-year', 'thanksgiving', 'diwali', 'satyanarayan', 'housewarming'];
    const validThemes = ['elegant', 'vibrant', 'modern'];

    if (!validOccasions.includes(occasion)) {
      return NextResponse.json(
        { error: 'Invalid occasion. Must be one of: ' + validOccasions.join(', ') },
        { status: 400 }
      );
    }

    if (!validThemes.includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be one of: ' + validThemes.join(', ') },
        { status: 400 }
      );
    }

    const template = await supabaseDb.createTemplate({
      name,
      occasion,
      theme,
      image_url,
      thumbnail_url,
      description,
      tags: tags || [],
      sort_order: sort_order || 0,
      is_active: true
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    logger.error({ error }, 'Error in POST /api/templates:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
