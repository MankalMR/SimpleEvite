/**
 * GET /api/demo/invite/:token — Public guest lookup by share_token (demo)
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoStore } from '@/lib/demo/demo-store';
import { isDemoEnabled, demoDisabledResponse } from '@/lib/demo/demo-guards';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    if (!isDemoEnabled()) return demoDisabledResponse();
    const resolvedParams = await params;

    // For the guest view, we need to find the invitation by share_token.
    // Try the session header first.
    const sessionId = request.headers.get('x-demo-session-id');

    if (sessionId) {
        const state = demoStore.get(sessionId);
        if (state) {
            const invitation = state.invitationsByTokenMap.get(resolvedParams.token);
            if (invitation) {
                return NextResponse.json({ invitation });
            }
        }
    }

    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
}
