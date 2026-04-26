'use client';

import { CopyLinkButton } from './copy-link-button';
import { QRCodeModal } from './qr-code';

interface ShareLinkGroupProps {
    /** The token to share */
    shareToken: string;
    /** The base URL to prepend to the token. Defaults to window.location.origin + '/invite/' */
    baseUrl?: string;
    /** Layout orientation for the buttons. Defaults to 'horizontal' */
    orientation?: 'horizontal' | 'vertical';
    /** Custom class for the wrapper div */
    className?: string;
    /** Custom class for the Copy Link button */
    copyButtonClassName?: string;
    /** Custom class for the QR Code button */
    qrButtonClassName?: string;
}

export function ShareLinkGroup({
    shareToken,
    baseUrl,
    orientation = 'horizontal',
    className = '',
    copyButtonClassName,
    qrButtonClassName
}: ShareLinkGroupProps) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    // If baseUrl is provided use it, otherwise fallback to standard invite link format
    const fullUrl = baseUrl
        ? `${baseUrl}${shareToken}`
        : (origin ? `${origin}/invite/${shareToken}` : '');

    return (
        <div className={`flex gap-1 ${orientation === 'vertical' ? 'flex-col sm:flex-row' : ''} ${className}`}>
            <CopyLinkButton
                shareToken={shareToken}
                baseUrl={baseUrl}
                className={copyButtonClassName}
            />
            <QRCodeModal
                url={fullUrl}
                className={qrButtonClassName}
            />
        </div>
    );
}
