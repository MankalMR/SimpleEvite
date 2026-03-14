import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { supabaseAdmin } from '@/lib/supabase';
import { validateInvitationData } from '@/lib/security';
import { logger } from "@/lib/logger";

// GET /api/invitations/[id] - Get invitation by ID (for owner)
export async function GET(
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

    // Get invitation using the database layer
    const invitation = await supabaseDb.getInvitation(resolvedParams.id, userData.id);

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/invitations/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/invitations/[id] - Update invitation
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

    // Validate and sanitize data
    const validation = validateInvitationData(body);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Invalid input',
        details: validation.errors
      }, { status: 400 });
    }

    const {
      title,
      description,
      event_date,
      event_time,
      location,
      hide_title,
      hide_description,
      organizer_notes,
      text_font_family
    } = validation.sanitizedData!;

    // Non-sanitized fields that don't need escaping
    const {
      design_id,
      text_overlay_style,
      text_position,
      text_size,
      text_shadow,
      text_background,
      text_background_opacity,
    } = body;

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      throw userError;
    }

    // Update invitation using the database layer
    const invitation = await supabaseDb.updateInvitation(resolvedParams.id, {
      title,
      description,
      event_date: event_date as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event_time: event_time as string | any,
      location,
      design_id: design_id || null,
      text_overlay_style,
      text_position,
      text_size,
      text_shadow,
      text_background,
      text_background_opacity,
      hide_title,
      hide_description,
      organizer_notes,
      text_font_family: text_font_family as "inter" | "playfair" | "lora" | "pacifico" | "oswald" | undefined,
    }, userData.id);

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    logger.error({ error }, 'Error in PUT /api/invitations/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/invitations/[id] - Delete invitation
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

    // Delete invitation using the database layer
    const success = await supabaseDb.deleteInvitation(resolvedParams.id, userData.id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error in DELETE /api/invitations/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
