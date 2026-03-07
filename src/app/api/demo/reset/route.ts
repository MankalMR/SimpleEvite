/**
 * POST /api/demo/reset — Reset session to fresh seed data
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoStore } from '@/lib/demo/demo-store';
import { demoGuard } from '@/lib/demo/demo-guards';

export async function POST(request: NextRequest) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { sessionId } = guard;

    demoStore.reset(sessionId);
    return NextResponse.json({ success: true });
}
