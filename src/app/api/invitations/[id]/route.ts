import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseDb } from '@/lib/database-supabase';
import { validateInvitationData } from '@/lib/security';
import { logger } from "@/lib/logger";
import { sendEventUpdateEmail } from '@/lib/email-service';

// GET /api/invitations/[id] - Get invitation by ID (for owner)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    // Get invitation using the database layer
    const invitation = await supabaseDb.getInvitation(resolvedParams.id, userId);

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
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
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
      rsvp_deadline,
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

    // Fetch original invitation to compare fields
    const originalInvitation = await supabaseDb.getInvitation(resolvedParams.id, userId);

    if (!originalInvitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const hasCoreDetailsChanged =
      originalInvitation.event_date !== event_date ||
      originalInvitation.event_time !== event_time ||
      originalInvitation.rsvp_deadline !== rsvp_deadline ||
      originalInvitation.location !== location ||
      originalInvitation.organizer_notes !== organizer_notes;

    // Update invitation using the database layer
    const invitation = await supabaseDb.updateInvitation(resolvedParams.id, {
      title,
      description,
      event_date: event_date as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event_time: event_time as string | any,
      rsvp_deadline: rsvp_deadline as string | undefined,
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
    }, userId);

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found or unauthorized' }, { status: 404 });
    }

    // Send event update emails
    if (hasCoreDetailsChanged) {
      try {
        const rsvps = await supabaseDb.getRSVPs(resolvedParams.id);
        const emailPromises = [];
        const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://evite.mankala.space'}/invite/${invitation.share_token}`;

        // ⚡ Bolt: Using for...of instead of chained .filter().map() to avoid intermediate array allocations
        for (const rsvp of rsvps) {
          if (rsvp.response === 'yes' && rsvp.email) {
            // Check if email notifications are enabled, assuming true by default
            const prefs = rsvp.notification_preferences as { email?: boolean } | null;
            if (prefs?.email !== false) {
              emailPromises.push(
                sendEventUpdateEmail({
                  to: rsvp.email as string,
                  guestName: rsvp.name,
                  eventTitle: invitation.title,
                  eventDate: invitation.event_date,
                  eventTime: invitation.event_time,
                  location: invitation.location,
                  description: invitation.description || undefined,
                  inviteUrl,
                  organizerNotes: invitation.organizer_notes || undefined,
                })
              );
            }
          }
        }

        if (emailPromises.length > 0) {
          // Await to ensure serverless function doesn't exit before sending
          await Promise.allSettled(emailPromises);
        }
      } catch (e) {
        logger.error({ e }, 'Error sending event update emails');
      }
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
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    // Delete invitation using the database layer
    const success = await supabaseDb.deleteInvitation(resolvedParams.id, userId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error in DELETE /api/invitations/[id]:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
