'use client';

import { useState } from 'react';
import { logger } from "@/lib/logger";

interface DemoBannerProps {
    onReset?: () => void;
}

export function DemoBanner({ onReset }: DemoBannerProps) {
    const [resetting, setResetting] = useState(false);

    const handleReset = async () => {
        setResetting(true);
        try {
            const sessionId = localStorage.getItem('demoSessionId');
            if (sessionId) {
                await fetch('/api/demo/reset', {
                    method: 'POST',
                    headers: { 'x-demo-session-id': sessionId },
                });
                localStorage.removeItem('demoSessionId');
            }
            onReset?.();
        } catch (error) {
            logger.error({ error }, 'Failed to reset demo:');
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="bg-amber-50 border-b-2 border-amber-300 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-bold text-lg">⚠️</span>
                    <span className="text-amber-800 font-semibold text-sm">
                        Demo Mode
                    </span>
                    <span className="text-amber-700 text-sm hidden sm:inline">
                        — Data is temporary and will not be saved.
                    </span>
                </div>
                <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="text-sm bg-amber-200 hover:bg-amber-300 text-amber-900 px-4 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {resetting ? 'Resetting…' : 'Reset Demo Data'}
                </button>
            </div>
        </div>
    );
}
