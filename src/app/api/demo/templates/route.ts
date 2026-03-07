/**
 * GET /api/demo/templates — Return demo templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoGuard } from '@/lib/demo/demo-guards';

export async function GET(request: NextRequest) {
    const guard = demoGuard(request);
    if (guard.error) return guard.error;
    const { state } = guard;

    return NextResponse.json({ templates: state.templates });
}
