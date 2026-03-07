/**
 * demo-store.ts
 *
 * In-memory session store for Simple Evite demo mode.
 * Pins only the sessions Map on globalThis so hot-reloads
 * always use fresh DemoStore methods while session data persists.
 */

import { DefaultTemplate } from '@/lib/supabase';
import { InvitationWithRSVPs } from '@/lib/database-supabase';
import { buildSeedData, SEED_VERSION } from './demo-seed-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DemoState {
    invitations: InvitationWithRSVPs[];
    templates: DefaultTemplate[];
    seedVersion: string;
    lastAccessed: number;
}

// Augment globalThis for hot-reload persistence
declare global {
    var __demoSessions: Map<string, DemoState> | undefined;
}

// Pin sessions Map on globalThis (survives hot-reloads)
const sessions: Map<string, DemoState> =
    globalThis.__demoSessions ?? new Map<string, DemoState>();
globalThis.__demoSessions = sessions;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SESSION_TTL_MS = (parseInt(process.env.DEMO_SESSION_TTL_HOURS || '2', 10)) * 60 * 60 * 1000;
const MAX_SESSIONS = parseInt(process.env.DEMO_MAX_SESSIONS || '100', 10);

// ---------------------------------------------------------------------------
// Eviction (runs periodically)
// ---------------------------------------------------------------------------

function evictStale(): void {
    const now = Date.now();
    for (const [id, state] of sessions.entries()) {
        if (now - state.lastAccessed > SESSION_TTL_MS) {
            sessions.delete(id);
        }
    }
}

// Evict stale sessions every 30 min
if (typeof setInterval !== 'undefined') {
    setInterval(evictStale, 30 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Enforce max sessions
// ---------------------------------------------------------------------------

function enforceMaxSessions(): void {
    if (sessions.size <= MAX_SESSIONS) return;
    // Evict oldest sessions first
    const sorted = [...sessions.entries()].sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    const toEvict = sorted.slice(0, sessions.size - MAX_SESSIONS);
    for (const [id] of toEvict) {
        sessions.delete(id);
    }
}

// ---------------------------------------------------------------------------
// DemoStore
// ---------------------------------------------------------------------------

function createFreshState(): DemoState {
    const { invitations, templates } = buildSeedData();
    return {
        invitations,
        templates,
        seedVersion: SEED_VERSION,
        lastAccessed: Date.now(),
    };
}

export const demoStore = {
    /** Return existing session, or create one with fresh seed data. */
    getOrCreate(sessionId: string): DemoState {
        let state = sessions.get(sessionId);

        // Auto-reseed if the code-level seed data has changed
        if (state && state.seedVersion !== SEED_VERSION) {
            state = undefined;
            sessions.delete(sessionId);
        }

        if (!state) {
            enforceMaxSessions();
            state = createFreshState();
            sessions.set(sessionId, state);
        }

        state.lastAccessed = Date.now();
        return state;
    },

    /** Return existing session without auto-creating. */
    get(sessionId: string): DemoState | undefined {
        const state = sessions.get(sessionId);
        if (state) state.lastAccessed = Date.now();
        return state;
    },

    /** Reset an existing session to fresh seed data. */
    reset(sessionId: string): DemoState {
        const state = createFreshState();
        sessions.set(sessionId, state);
        return state;
    },
};
