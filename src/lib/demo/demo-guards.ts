/**
 * demo-guards.ts
 *
 * Shared guard utilities for all /api/demo/* route handlers.
 *
 * Usage:
 *   const guard = demoGuard(request);
 *   if (guard.error) return guard.error;
 *   const { sessionId, state } = guard;
 */

import { NextRequest, NextResponse } from 'next/server';
import { demoStore, DemoState } from '@/lib/demo/demo-store';

/** Returns true when demo mode is enabled via ENABLE_DEMO_MODE=1. */
export const isDemoEnabled = (): boolean => process.env.ENABLE_DEMO_MODE === '1';

/** Extracts the demo session ID from the x-demo-session-id header. */
export const getSessionId = (request: NextRequest): string | null =>
    request.headers.get('x-demo-session-id');

/** 404 response when demo mode is disabled. */
export const demoDisabledResponse = () =>
    NextResponse.json({ error: 'Demo mode is disabled' }, { status: 404 });

/** 400 response when session header is missing. */
export const missingSessionResponse = () =>
    NextResponse.json({ error: 'Missing x-demo-session-id header' }, { status: 400 });

// ---------------------------------------------------------------------------
// Main guard — call at the top of every demo route handler.
// ---------------------------------------------------------------------------

type DemoGuardOk = { error: null; sessionId: string; state: DemoState };
type DemoGuardFail = { error: NextResponse; sessionId: null; state: null };

/**
 * Validates:
 *   1. ENABLE_DEMO_MODE === '1'
 *   2. Valid x-demo-session-id header
 *
 * Returns `{ sessionId, state }` on success, or `{ error }` to short-circuit.
 */
export function demoGuard(request: NextRequest): DemoGuardOk | DemoGuardFail {
    if (!isDemoEnabled()) {
        return { error: demoDisabledResponse(), sessionId: null, state: null };
    }

    const sessionId = getSessionId(request);
    if (!sessionId) {
        return { error: missingSessionResponse(), sessionId: null, state: null };
    }

    const state = demoStore.getOrCreate(sessionId);
    return { error: null, sessionId, state };
}
