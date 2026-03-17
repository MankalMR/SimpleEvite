'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { formatShortDate, isDateInPast } from '@/lib/date-utils';
import { getRSVPStats, getTotalRSVPCount, getGlobalRSVPStats } from '@/lib/rsvp-utils';
import { useInvitations } from '@/hooks/useInvitations';
import { getInvitationImageUrl, hasInvitationDesign } from '@/lib/invitation-utils';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { InlineError } from '@/components/inline-error';
import { Check, Link as LinkIcon, Eye } from 'lucide-react';

export default function Dashboard() {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    invitations,
    loading,
    error,
    fetchInvitations,
    deleteInvitation,
  } = useInvitations();

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleDeleteInvitation = async (id: string) => {
    setActionError(null);
    try {
      await deleteInvitation(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete invitation');
    }
  };

  const handleCopyLink = (shareToken: string) => {
    const url = `${window.location.origin}/invite/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(shareToken);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  // Global stats across all invitations
  const stats = useMemo(() => {
    const now = new Date();
    return {
      globalStats: getGlobalRSVPStats(invitations),
      totalInvitations: invitations.length,
      totalRSVPs: getTotalRSVPCount(invitations),
      activeEventsCount: invitations.filter(inv => new Date(inv.event_date) >= now).length
    };
  }, [invitations]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <Link
              href="/create"
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
                <p className="text-3xl font-bold text-blue-600">{stats.totalInvitations}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total RSVPs</h3>
                <p className="text-3xl font-bold text-green-600">{stats.totalRSVPs}</p>
                <div className="text-sm text-gray-600 mt-1">
                  {stats.globalStats.yes} Yes, {stats.globalStats.maybe} Maybe, {stats.globalStats.no} No
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Events</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.activeEventsCount}
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
              <Link
                href="/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${isUpcoming
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {isUpcoming ? 'Upcoming' : 'Past'}
                        </span>
                      </div>

                      <p className="text-gray-800 text-sm mb-4 font-medium">
                        {formatShortDate(invitation.event_date)}
                        {invitation.event_time && ` at ${invitation.event_time}`}
                      </p>

                      <div className="flex justify-between text-sm text-gray-600 mb-4">
                        <span className="text-green-600 font-medium">
                          ✓ {rsvpStats.yes} Yes
                        </span>
                        <span className="text-yellow-600 font-medium">
                          ? {rsvpStats.maybe} Maybe
                        </span>
                        <span className="text-red-600 font-medium">
                          ✗ {rsvpStats.no} No
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyLink(invitation.share_token)}
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center gap-1.5 ${copySuccess === invitation.share_token
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          aria-label={copySuccess === invitation.share_token ? 'Link copied to clipboard' : 'Copy invite link to clipboard'}
                        >
                          {copySuccess === invitation.share_token ? (
                            <>
                              <Check className="w-4 h-4 flex-shrink-0" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <LinkIcon className="w-4 h-4 flex-shrink-0" />
                              Copy Link
                            </>
                          )}
                        </button>
                        <Link
                          href={`/invitations/${invitation.id}`}
                          className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-50 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4 flex-shrink-0" />
                          View
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
    </ProtectedRoute>
  );
}
