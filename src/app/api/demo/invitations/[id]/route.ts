/**
 * GET    /api/demo/invitations/:id  — fetch a single invitation
 * PUT    /api/demo/invitations/:id  — update an invitation
 * DELETE /api/demo/invitations/:id  — delete an invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoGuard } from '@/lib/demo/demo-guards';
import { InvitationWithRSVPs } from '@/lib/database-supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { state } = guard;
    const resolvedParams = await params;

    const invitation = state.invitations.find((i: InvitationWithRSVPs) => i.id === resolvedParams.id);
    if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { state } = guard;
    const resolvedParams = await params;

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const idx = state.invitations.findIndex((i: InvitationWithRSVPs) => i.id === resolvedParams.id);
    if (idx === -1) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const updated = {
        ...state.invitations[idx],
        ...body,
        id: state.invitations[idx].id, // prevent ID override
        user_id: state.invitations[idx].user_id,
        share_token: state.invitations[idx].share_token,
        updated_at: new Date().toISOString(),
    };
    state.invitations[idx] = updated;

    return NextResponse.json({ invitation: updated });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { state } = guard;
    const resolvedParams = await params;

    const originalLength = state.invitations.length;
    state.invitations = state.invitations.filter((i: InvitationWithRSVPs) => i.id !== resolvedParams.id);

    if (state.invitations.length === originalLength) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
