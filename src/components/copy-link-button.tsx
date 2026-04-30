'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';

interface CopyLinkButtonProps {
    /** The token or URL fragment to be copied */
    shareToken: string;
    /** Optional custom CSS classes for styling */
    className?: string;
    /** The base URL to prepend to the token. Defaults to window.location.origin + '/invite/' */
    baseUrl?: string;
    /** Text to show before copying */
    label?: string;
    /** Text to show after copying */
    copiedLabel?: string;
}

export function CopyLinkButton({
    shareToken,
    className = 'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center gap-1.5',
    baseUrl,
    label = 'Copy Link',
    copiedLabel = 'Copied!'
}: CopyLinkButtonProps) {
    const [isCopied, setIsCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleCopy = useCallback(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const url = baseUrl ? `${baseUrl}${shareToken}` : `${origin}/invite/${shareToken}`;

        navigator.clipboard.writeText(url).then(() => {
            setIsCopied(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setIsCopied(false), 2000);
        });
    }, [shareToken, baseUrl]);

    const Icon = isCopied ? Check : LinkIcon;
    const baseColorClass = isCopied
        ? 'bg-green-600 text-white hover:bg-green-700'
        : 'bg-blue-600 text-white hover:bg-blue-700';

    return (
        <button
            onClick={handleCopy}
            className={`${className} ${baseColorClass}`}
            aria-label={isCopied ? 'Link copied to clipboard' : 'Copy invite link to clipboard'}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {isCopied ? copiedLabel : label}
        </button>
    );
}
