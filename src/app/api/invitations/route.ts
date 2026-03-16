import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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
      location,
      hide_title,
      hide_description,
      organizer_notes,
      text_font_family
    } = validation.sanitizedData!;

    const {
      design_id,
      text_overlay_style,
      text_position,
      text_size,
      text_shadow,
      text_background,
      text_background_opacity,
    } = body;

    // Debug logging
    logger.info({
      data0: {
        text_overlay_style: text_overlay_style || 'light',
        text_position: text_position || 'center',
        text_size: text_size || 'large',
        text_shadow: text_shadow ?? true,
        text_background: text_background ?? false,
        text_background_opacity: text_background_opacity ?? 0.3,
      }
    }, 'Creating invitation with text overlay settings:');

    // Create invitation using the database layer
    const shareToken = uuidv4();
    const invitation = await supabaseDb.createInvitation({
      user_id: userId,
      title,
      description,
      event_date: event_date as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event_time: event_time as string | any,
      location,
      design_id: design_id || null,
      share_token: shareToken,
      text_overlay_style: text_overlay_style || 'light',
      text_position: text_position || 'center',
      text_size: text_size || 'large',
      text_shadow: text_shadow ?? true,
      text_background: text_background ?? false,
      text_background_opacity: text_background_opacity ?? 0.3,
      hide_title: hide_title ?? false,
      hide_description: hide_description ?? false,
      organizer_notes: organizer_notes || undefined,
      text_font_family: text_font_family as "inter" | "playfair" | "lora" | "pacifico" | "oswald" | undefined || 'inter',
    }, userId);

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    logger.error({ error }, 'Error in POST /api/invitations:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}