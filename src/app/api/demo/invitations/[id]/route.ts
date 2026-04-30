/**
 * GET    /api/demo/invitations/:id  — fetch a single invitation
 * PUT    /api/demo/invitations/:id  — update an invitation
 * DELETE /api/demo/invitations/:id  — delete an invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoGuard } from '@/lib/demo/demo-guards';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { state } = guard;
    const resolvedParams = await params;

    const invitation = state.invitationsMap.get(resolvedParams.id);
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

    const existing = state.invitationsMap.get(resolvedParams.id);
    if (!existing) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const updated = {
        ...existing,
        ...body,
        id: existing.id, // prevent ID override
        user_id: existing.user_id,
        share_token: existing.share_token,
        updated_at: new Date().toISOString(),
    };

    // Update in all places
    const idx = state.invitations.findIndex(i => i.id === resolvedParams.id);
    if (idx !== -1) {
        state.invitations[idx] = updated;
    }
    state.invitationsMap.set(updated.id, updated);
    state.invitationsByTokenMap.set(updated.share_token, updated);

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

    const existing = state.invitationsMap.get(resolvedParams.id);
    if (!existing) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Remove from all places
    state.invitations = state.invitations.filter(i => i.id !== resolvedParams.id);
    state.invitationsMap.delete(resolvedParams.id);
    state.invitationsByTokenMap.delete(existing.share_token);

    return NextResponse.json({ success: true });
}
