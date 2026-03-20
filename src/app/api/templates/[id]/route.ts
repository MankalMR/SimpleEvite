import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from "@/lib/logger";

// GET /api/templates/[id] - Get single template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { data, error } = await supabaseAdmin
      .from('default_templates')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      logger.error({ error }, 'Error fetching template:');
      return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }

    // ⚡ Bolt: Added Cache-Control to reduce DB load and improve TTFB for infrequently changing default templates
    return NextResponse.json(
      { template: data },
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

    const resolvedParams = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('default_templates')
      .update(body)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      logger.error({ error }, 'Error updating template:');
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({ template: data });
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

    const resolvedParams = await params;
    const { error } = await supabaseAdmin
      .from('default_templates')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      logger.error({ error }, 'Error deleting template:');
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error in DELETE /api/templates/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
