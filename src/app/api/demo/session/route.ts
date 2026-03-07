/**
 * POST /api/demo/session — Create or reuse a demo session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoStore } from '@/lib/demo/demo-store';
import { isDemoEnabled, demoDisabledResponse } from '@/lib/demo/demo-guards';

export async function POST(request: NextRequest) {
    if (!isDemoEnabled()) return demoDisabledResponse();

    const body = await request.json().catch(() => ({}));
    const existingId: string | undefined = body?.sessionId;

    let sessionId: string;
    if (existingId && demoStore.get(existingId)) {
        sessionId = existingId;
    } else {
        sessionId = crypto.randomUUID();
    }

    demoStore.getOrCreate(sessionId);
    return NextResponse.json({ sessionId });
}
