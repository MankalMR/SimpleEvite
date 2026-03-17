'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type DeleteState = 'idle' | 'confirming' | 'deleting';

interface ConfirmDeleteButtonProps {
    /** Called when the user confirms the deletion */
    onConfirm: () => Promise<void> | void;
    /** Label shown in idle state */
    label?: string;
    /** Label shown in confirming state */
    confirmLabel?: string;
    /** Additional CSS classes for the outer button */
    className?: string;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Auto-reset timeout in milliseconds (default: 3000) */
    resetTimeout?: number;
    /** Size variant */
    size?: 'sm' | 'md';
}

/**
 * A two-click inline delete confirmation button.
 *
 * Click 1: transforms from "Delete" → "Are you sure?"
 * Click 2: fires `onConfirm` and shows "Deleting…"
 * Auto-resets to idle after `resetTimeout` ms if not confirmed.
 *
 * Accessibility:
 * - Uses `aria-live="assertive"` so screen readers announce the state change
 * - Changes `aria-label` to describe the current action
 * - Includes a debounce guard against accidental double-clicks
 */
export function ConfirmDeleteButton({
    onConfirm,
    label = 'Delete',
    confirmLabel = 'Are you sure?',
    className = '',
    disabled = false,
    resetTimeout = 3000,
    size = 'md',
}: ConfirmDeleteButtonProps) {
    const [state, setState] = useState<DeleteState>('idle');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const debounceRef = useRef(false);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const resetToIdle = useCallback(() => {
        setState('idle');
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleClick = useCallback(async () => {
        // Debounce guard — prevent accidental double-clicks (300ms)
        if (debounceRef.current) return;
        debounceRef.current = true;
        setTimeout(() => { debounceRef.current = false; }, 300);

        if (state === 'idle') {
            // First click → show confirmation
            setState('confirming');
            timerRef.current = setTimeout(resetToIdle, resetTimeout);
        } else if (state === 'confirming') {
            // Second click → execute delete
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            setState('deleting');
            try {
                await onConfirm();
            } catch {
                // If delete fails, reset to idle
                setState('idle');
            }
        }
    }, [state, onConfirm, resetTimeout, resetToIdle]);

    const sizeClasses = size === 'sm'
        ? 'px-2 py-1 text-xs'
        : 'px-3 py-2 text-sm';

    const baseClasses = `${sizeClasses} rounded font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center justify-center gap-1.5`;

    const stateClasses = {
        idle: 'border border-red-300 text-red-700 hover:bg-red-50 focus:ring-red-400',
        confirming: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 animate-pulse',
        deleting: 'bg-red-400 text-white cursor-not-allowed opacity-75',
    };

    const ariaLabels = {
        idle: label,
        confirming: `${confirmLabel} Click again to confirm deletion.`,
        deleting: 'Deleting...',
    };

    const displayText = {
        idle: label,
        confirming: confirmLabel,
        deleting: 'Deleting…',
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled || state === 'deleting'}
            className={`${baseClasses} ${stateClasses[state]} ${className}`}
            aria-label={ariaLabels[state]}
            aria-live="assertive"
        >
            {state === 'idle' && (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            )}
            {state === 'confirming' && (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )}
            {state === 'deleting' && (
                <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {displayText[state]}
        </button>
    );
}
