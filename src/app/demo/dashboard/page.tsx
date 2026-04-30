'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DemoBanner } from '@/components/DemoBanner';
import { formatShortDate, isDateInPast } from '@/lib/date-utils';
import { getRSVPStats, getGlobalRSVPStats } from '@/lib/rsvp-utils';
import { getInvitationImageUrl, hasInvitationDesign } from '@/lib/invitation-utils';
import { InvitationWithRSVPs } from '@/lib/database-supabase';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { InlineError } from '@/components/inline-error';
import { Eye, Mail, Users, CalendarDays } from 'lucide-react';
import { ShareLinkGroup } from '@/components/share-link-group';

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
            <div className="py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold tracking-tighter text-foreground mb-1">Demo Dashboard</h1>
                        <p className="text-muted-foreground text-sm font-medium">Manage your digital stationery and guest lists.</p>
                    </div>

                    <InlineError error={error} />
                    <InlineError error={actionError} onDismiss={() => setActionError(null)} />

                    <div className="mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-muted/50 p-6 rounded-[var(--radius)] border-none">
                                <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Invitations</h3>
                                <p className="text-3xl font-bold text-foreground">{totalInvitations}</p>
                            </div>
                            <div className="bg-muted/50 p-6 rounded-[var(--radius)] border-none">
                                <div className="w-10 h-10 bg-green-500/10 rounded-md flex items-center justify-center mb-4">
                                    <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Attending</h3>
                                <p className="text-3xl font-bold text-foreground">{globalStats.attendingCount}</p>
                            </div>
                            <div className="bg-muted/50 p-6 rounded-[var(--radius)] border-none">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-md flex items-center justify-center mb-4">
                                    <CalendarDays className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Events</h3>
                                <p className="text-3xl font-bold text-foreground">
                                    {invitations.filter(inv => !isDateInPast(inv.event_date)).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Invitations</h2>
                        <Link href="/demo/create" className="text-sm font-medium text-primary hover:underline">View All</Link>
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
                                    <div 
                                        key={invitation.id} 
                                        className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(45,91,255,0.08)] hover:-translate-y-1"
                                    >
                                        {hasInvitationDesign(invitation) && (
                                            <div className="aspect-video bg-muted relative">
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
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-bold text-foreground truncate">
                                                    {invitation.title}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full ${isUpcoming ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {isUpcoming ? 'Upcoming' : 'Past'}
                                                </span>
                                            </div>

                                            <p className="text-muted-foreground text-xs font-medium mb-5">
                                                {formatShortDate(invitation.event_date)}
                                                {invitation.event_time && ` • ${invitation.event_time}`}
                                            </p>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 bg-muted/30 p-3 rounded-md">
                                                <span className="text-foreground font-semibold flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-green-500" />
                                                    {rsvpStats.attendingCount} Attending
                                                </span>
                                                <span className="text-muted-foreground font-medium text-xs">
                                                    {rsvpStats.maybe} Maybe • {rsvpStats.no} No
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-3 mt-auto">
                                                <ShareLinkGroup
                                                    shareToken={invitation.share_token}
                                                    baseUrl={typeof window !== 'undefined' ? `${window.location.origin}/demo/i/` : ''}
                                                    className="w-full"
                                                />
                                                <div className="flex gap-2 w-full">
                                                    <Link
                                                        href={`/demo/i/${invitation.share_token}`}
                                                        className="flex-1 bg-muted/50 text-foreground px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 flex items-center justify-center gap-1.5"
                                                    >
                                                        <Eye className="w-4 h-4 flex-shrink-0" />
                                                        Preview
                                                    </Link>
                                                    <ConfirmDeleteButton
                                                        onConfirm={() => handleDeleteInvitation(invitation.id)}
                                                        className="flex-1"
                                                    />
                                                </div>
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
