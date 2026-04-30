import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { validateInvitationData } from '@/lib/security';
import { v4 as uuidv4 } from 'uuid';
import { logger } from "@/lib/logger";

// GET /api/invitations - Get user's invitations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get invitations using the database layer
    const invitations = await supabaseDb.getInvitations(userId);

    return NextResponse.json({ invitations });
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/invitations:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invitations - Create new invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      rsvp_deadline,
      location,
      design_id,
      hide_title,
      hide_description,
      organizer_notes,
      text_font_family,
      text_overlay_style,
      text_position,
      text_size,
      text_shadow,
      text_background,
      text_background_opacity,
    } = validation.sanitizedData!;

    // Debug logging
    logger.info({
      data0: {
        text_overlay_style,
        text_position,
        text_size,
        text_shadow,
        text_background,
        text_background_opacity,
      }
    }, 'Creating invitation with text overlay settings:');

    // Create invitation using the database layer
    const shareToken = uuidv4();
    const invitation = await supabaseDb.createInvitation({
      user_id: userId,
      title,
      description,
      event_date,
      event_time,
      rsvp_deadline,
      location,
      design_id,
      share_token: shareToken,
      text_overlay_style,
      text_position,
      text_size,
      text_shadow,
      text_background,
      text_background_opacity,
      hide_title,
      hide_description,
      organizer_notes,
      text_font_family,
    }, userId);

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    logger.error({ error }, 'Error in POST /api/invitations:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}