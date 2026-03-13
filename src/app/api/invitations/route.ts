import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { supabaseAdmin } from '@/lib/supabase';
import { validateInvitationData } from '@/lib/security';
import { v4 as uuidv4 } from 'uuid';

// GET /api/invitations - Get user's invitations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      // If user doesn't exist yet, return empty invitations array
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ invitations: [] });
      }
      throw userError;
    }

    // Get invitations using the database layer
    const invitations = await supabaseDb.getInvitations(userData.id);

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error in GET /api/invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invitations - Create new invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
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
      // If user doesn't exist yet, this shouldn't happen in POST, but handle gracefully
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found. Please sign in again.' }, { status: 404 });
      }
      throw userError;
    }

    // Debug logging
    console.log('Creating invitation with text overlay settings:', {
      text_overlay_style: text_overlay_style || 'light',
      text_position: text_position || 'center',
      text_size: text_size || 'large',
      text_shadow: text_shadow ?? true,
      text_background: text_background ?? false,
      text_background_opacity: text_background_opacity ?? 0.3,
    });

    // Create invitation using the database layer
    const shareToken = uuidv4();
    const invitation = await supabaseDb.createInvitation({
      user_id: userData.id,
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
    }, userData.id);

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}