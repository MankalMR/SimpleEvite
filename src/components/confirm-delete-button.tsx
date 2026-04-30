'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

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

    const baseClasses = `${sizeClasses} rounded-md font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center justify-center gap-1.5`;

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

    const Icon = state === 'idle' ? Trash2 : state === 'confirming' ? AlertTriangle : Loader2;

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled || state === 'deleting'}
            className={`${baseClasses} ${stateClasses[state]} ${className}`}
            aria-label={ariaLabels[state]}
            aria-live="assertive"
        >
            <Icon className={`w-4 h-4 flex-shrink-0 ${state === 'deleting' ? 'animate-spin' : ''}`} />
            {displayText[state]}
        </button>
    );
}
