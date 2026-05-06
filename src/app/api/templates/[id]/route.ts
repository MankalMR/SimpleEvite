import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/database-supabase';
import { logger } from "@/lib/logger";

// GET /api/templates/[id] - Get single template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const template = await supabaseDb.getDefaultTemplate(resolvedParams.id);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // ⚡ Bolt: Added Cache-Control to reduce DB load and improve TTFB for infrequently changing default templates
    return NextResponse.json(
      { template: template },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/templates/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/templates/[id] - Update template (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an admin
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      logger.warn({ email: session.user.email }, 'Unauthorized template update attempt by non-admin');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();

    const template = await supabaseDb.upsertDefaultTemplate(body, resolvedParams.id);

    return NextResponse.json({ template });
  } catch (error) {
    logger.error({ error }, 'Error in PUT /api/templates/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/templates/[id] - Delete template (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an admin
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      logger.warn({ email: session.user.email }, 'Unauthorized template deletion attempt by non-admin');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const success = await supabaseDb.deleteDefaultTemplate(resolvedParams.id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error in DELETE /api/templates/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
