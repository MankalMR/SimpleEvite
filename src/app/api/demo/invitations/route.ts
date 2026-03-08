/**
 * GET  /api/demo/invitations      — list all invitations for the session
 * POST /api/demo/invitations      — create a new invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoGuard } from '@/lib/demo/demo-guards';
import { InvitationWithRSVPs } from '@/lib/database-supabase';

export async function GET(request: NextRequest) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { state } = guard;

    return NextResponse.json({ invitations: state.invitations });
}

export async function POST(request: NextRequest) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { state } = guard;

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!body.title || !body.event_date) {
        return NextResponse.json({ error: 'Title and event date are required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const shareToken = crypto.randomUUID();

    const newInvitation: InvitationWithRSVPs = {
        id: crypto.randomUUID(),
        user_id: 'demo-user',
        title: body.title,
        description: body.description || '',
        event_date: body.event_date,
        event_time: body.event_time || '',
        location: body.location || '',
        design_id: body.design_id || undefined,
        share_token: shareToken,
        created_at: now,
        updated_at: now,
        text_overlay_style: body.text_overlay_style || 'light',
        text_position: body.text_position || 'center',
        text_size: body.text_size || 'large',
        text_shadow: body.text_shadow ?? true,
        text_background: body.text_background ?? false,
        text_background_opacity: body.text_background_opacity ?? 0.3,
        hide_title: body.hide_title ?? false,
        hide_description: body.hide_description ?? false,
        organizer_notes: body.organizer_notes || undefined,
        text_font_family: body.text_font_family || 'inter',
        rsvps: [],
    };

    // If using a demo template, attach it
    if (body.design_id) {
        const template = state.templates.find(t => t.id === body.design_id);
        if (template) {
            newInvitation.default_templates = template;
        }
    }

    state.invitations.unshift(newInvitation);
    return NextResponse.json({ invitation: newInvitation }, { status: 201 });
}
