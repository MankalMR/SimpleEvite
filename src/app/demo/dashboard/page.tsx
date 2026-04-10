'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DemoBanner } from '@/components/DemoBanner';
import { formatShortDate, isDateInPast } from '@/lib/date-utils';
import { getRSVPStats, getTotalRSVPCount, getGlobalRSVPStats } from '@/lib/rsvp-utils';
import { getInvitationImageUrl, hasInvitationDesign } from '@/lib/invitation-utils';
import { InvitationWithRSVPs } from '@/lib/database-supabase';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { InlineError } from '@/components/inline-error';
import { Eye } from 'lucide-react';
import { CopyLinkButton } from '@/components/copy-link-button';
import { QRCodeModal } from '@/components/qr-code';

export default function DemoDashboard() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [invitations, setInvitations] = useState<InvitationWithRSVPs[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Initialize session
    useEffect(() => {
        async function initSession() {
            const stored = localStorage.getItem('demoSessionId');
            if (stored) {
                setSessionId(stored);
                return;
            }

            try {
                const res = await fetch('/api/demo/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
                const data = await res.json();
                localStorage.setItem('demoSessionId', data.sessionId);
                setSessionId(data.sessionId);
            } catch {
                setError('Failed to initialize demo session');
            }
        }
        initSession();
    }, []);

    // Fetch invitations when session is ready
    const fetchInvitations = useCallback(async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/demo/invitations', {
                headers: { 'x-demo-session-id': sessionId },
            });
            const data = await res.json();
            setInvitations(data.invitations || []);
        } catch {
            setError('Failed to load invitations');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleDeleteInvitation = async (id: string) => {
        if (!sessionId) return;
        setActionError(null);

        try {
            await fetch(`/api/demo/invitations/${id}`, {
                method: 'DELETE',
                headers: { 'x-demo-session-id': sessionId },
            });
            setInvitations(prev => prev.filter(i => i.id !== id));
        } catch {
            setActionError('Failed to delete invitation');
        }
    };

    const handleReset = () => {
        setSessionId(null);
        setInvitations([]);
        setLoading(true);
        // Re-initialize
        fetch('/api/demo/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        })
            .then(res => res.json())
            .then(data => {
                localStorage.setItem('demoSessionId', data.sessionId);
                setSessionId(data.sessionId);
            });
    };

    // Stats
    const globalStats = getGlobalRSVPStats(invitations);
    const totalInvitations = invitations.length;
    const totalRSVPs = getTotalRSVPCount(invitations);

    if (loading) {
        return (
            <>
                <DemoBanner onReset={handleReset} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <DemoBanner onReset={handleReset} />
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Demo Dashboard</h1>
                        <Link
                            href="/demo/create"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                            Create New Invite
                        </Link>
                    </div>

                    <InlineError error={error} />
                    <InlineError error={actionError} onDismiss={() => setActionError(null)} />

                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Invitations</h3>
                                <p className="text-3xl font-bold text-blue-600">{totalInvitations}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Attending</h3>
                                <p className="text-3xl font-bold text-green-600">{globalStats.attendingCount}</p>
                                <div className="text-sm text-gray-600 mt-1">
                                    {globalStats.yes} Yes, {globalStats.maybe} Maybe, {globalStats.no} No
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Events</h3>
                                <p className="text-3xl font-bold text-purple-600">
                                    {invitations.filter(inv => !isDateInPast(inv.event_date)).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {invitations.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No invitations yet</h3>
                            <p className="text-gray-800 mb-6 font-medium">Get started by creating your first event invitation.</p>
                            <Link href="/demo/create" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                                Create Your First Invite
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {invitations.map((invitation) => {
                                const rsvpStats = getRSVPStats(invitation.rsvps || []);
                                const isUpcoming = !isDateInPast(invitation.event_date);

                                return (
                                    <div key={invitation.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                        {hasInvitationDesign(invitation) && (
                                            <div className="h-48 bg-gray-100 relative">
                                                <Image
                                                    src={getInvitationImageUrl(invitation) || ''}
                                                    alt={invitation.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {invitation.title}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {isUpcoming ? 'Upcoming' : 'Past'}
                                                </span>
                                            </div>

                                            <p className="text-gray-800 text-sm mb-4 font-medium">
                                                {formatShortDate(invitation.event_date)}
                                                {invitation.event_time && ` at ${invitation.event_time}`}
                                            </p>

                                            <div className="flex justify-between text-sm text-gray-600 mb-4">
                                                <span className="text-green-600 font-medium">✓ {rsvpStats.attendingCount} Attending</span>
                                                <span className="text-yellow-600 font-medium">? {rsvpStats.maybe} Maybe</span>
                                                <span className="text-red-600 font-medium">✗ {rsvpStats.no} No</span>
                                            </div>

                                            <div className="flex gap-2">
                                                <div className="flex gap-1">
                                                    <CopyLinkButton
                                                        shareToken={invitation.share_token}
                                                        baseUrl={typeof window !== 'undefined' ? `${window.location.origin}/demo/i/` : ''}
                                                    />
                                                    <QRCodeModal
                                                        url={typeof window !== 'undefined' ? `${window.location.origin}/demo/i/${invitation.share_token}` : ''}
                                                    />
                                                </div>
                                                <Link
                                                    href={`/demo/i/${invitation.share_token}`}
                                                    className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-50 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center gap-1.5"
                                                >
                                                    <Eye className="w-4 h-4 flex-shrink-0" />
                                                    Preview
                                                </Link>
                                                <ConfirmDeleteButton
                                                    onConfirm={() => handleDeleteInvitation(invitation.id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
