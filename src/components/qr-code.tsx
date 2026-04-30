'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X } from 'lucide-react';

interface QRCodeModalProps {
    /** The full URL to be encoded in the QR code */
    url: string;
    /** Optional custom CSS classes for styling the trigger button */
    className?: string;
}

export function QRCodeModal({
    url,
    className = 'flex-1 sm:flex-initial px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 flex items-center justify-center gap-1.5'
}: QRCodeModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={className}
                aria-label="Show QR Code"
            >
                <QrCode className="w-4 h-4 flex-shrink-0" />
                QR
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="qr-modal-title"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 id="qr-modal-title" className="text-lg font-semibold text-gray-900">Scan to RSVP</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Close QR Code modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 flex flex-col items-center justify-center bg-gray-50/50">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <QRCodeSVG
                                    value={url}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    className="w-full h-auto max-w-[200px]"
                                />
                            </div>
                            <p className="mt-6 text-sm text-gray-500 text-center">
                                Point your camera at this code to view and RSVP to the invitation.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 w-full sm:w-auto"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
