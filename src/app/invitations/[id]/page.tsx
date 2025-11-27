'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';
import { formatDisplayDate } from '@/lib/date-utils';
import { getRSVPStats } from '@/lib/rsvp-utils';
import { copyInviteLink } from '@/lib/clipboard-utils';
import { useInvitations } from '@/hooks/useInvitations';
import { InvitationDisplay } from '@/components/invitation-display';
import { getInvitationDesign } from '@/lib/invitation-utils';

export default function InvitationView() {
  const params = useParams();
  const id = params.id as string;

  const {
    invitation,
    invitationLoading: loading,
    invitationError: error,
    fetchInvitation,
  } = useInvitations();

  useEffect(() => {
    if (id) {
      fetchInvitation(id);
    }
  }, [id, fetchInvitation]);

  const handleCopyInviteLink = () => {
    if (!invitation) return;
    copyInviteLink(invitation.share_token);
  };

  const deleteRSVP = async (rsvpId: string) => {
    if (!confirm('Are you sure you want to delete this RSVP?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rsvp/${rsvpId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete RSVP');
      }

      // Refresh invitation data to get updated RSVP list
      await fetchInvitation(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete RSVP');
    }
  };

  const deleteInvitation = async () => {
    if (!invitation || !confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/invitations/${invitation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invitation');
      }

      alert('Invitation deleted successfully!');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An unexpected error occurred.');
    }
  };

  // Using formatDisplayDate from date-utils to avoid timezone issues

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Using getRSVPStats utility function

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !invitation) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Invitation not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The invitation may have been deleted or you don&apos;t have permission to view it.
            </p>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const rsvpStats = getRSVPStats(invitation.rsvps || []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{invitation.title}</h1>
                <p className="text-gray-700 font-medium">
                  Created {new Date(invitation.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Mobile: Stack actions vertically, Desktop: Horizontal */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Primary actions - most important first on mobile */}
                <button
                  onClick={handleCopyInviteLink}
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Copy Invite Link
                </button>

                <div className="flex gap-2">
                  <Link
                    href={`/invitations/${invitation.id}/edit`}
                    className="flex-1 sm:flex-initial border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/invite/${invitation.share_token}`}
                    target="_blank"
                    className="flex-1 sm:flex-initial border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                  >
                    Preview
                  </Link>
                </div>

                {/* Destructive action - separated and less prominent on mobile */}
                <button
                  onClick={deleteInvitation}
                  className="border border-red-300 text-red-700 px-4 py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors text-center"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>

          {/* Complete Invitation Preview */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Invitation Preview</h3>
            <InvitationDisplay
              invitation={invitation}
              design={getInvitationDesign(invitation)}
              className="h-96 w-full rounded-lg"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Date</h3>
              <p className="text-gray-800 mb-4 font-medium">{formatDisplayDate(invitation.event_date)}</p>

              {invitation.event_time && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">Time</h3>
                  <p className="text-gray-800 mb-4 font-medium">{formatTime(invitation.event_time)}</p>
                </>
              )}

              {invitation.location && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-800 font-medium">{invitation.location}</p>
                </>
              )}
            </div>

            <div>
              {invitation.description && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-800 font-medium">{invitation.description}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RSVP Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">RSVP Summary</h2>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{rsvpStats.yes}</div>
              <div className="text-sm text-gray-800 font-medium">Yes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{rsvpStats.maybe}</div>
              <div className="text-sm text-gray-800 font-medium">Maybe</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{rsvpStats.no}</div>
              <div className="text-sm text-gray-800 font-medium">No</div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-800 font-medium">
            Total Responses: {(invitation.rsvps || []).length}
          </div>
        </div>

        {/* RSVP List */}
        {invitation.rsvps && invitation.rsvps.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All RSVPs</h2>

            <div className="space-y-4">
              {invitation.rsvps
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      rsvp.response === 'yes'
                        ? 'bg-green-50 border-green-500'
                        : rsvp.response === 'no'
                        ? 'bg-red-50 border-red-500'
                        : 'bg-yellow-50 border-yellow-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{rsvp.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            rsvp.response === 'yes'
                              ? 'bg-green-100 text-green-800'
                              : rsvp.response === 'no'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rsvp.response === 'yes' ? 'Attending' :
                             rsvp.response === 'no' ? 'Not Attending' :
                             'Maybe'}
                          </span>

                          {/* Notification Status Badge */}
                          {rsvp.response === 'yes' && rsvp.email && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                              rsvp.reminder_status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : rsvp.reminder_status === 'pending'
                                ? 'bg-gray-100 text-gray-700'
                                : rsvp.reminder_status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {rsvp.reminder_status === 'sent' ? (
                                <>
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                  </svg>
                                  Reminder Sent
                                </>
                              ) : rsvp.reminder_status === 'pending' ? (
                                <>
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Reminder Pending
                                </>
                              ) : rsvp.reminder_status === 'failed' ? (
                                <>
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Send Failed
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                  </svg>
                                  No Reminder
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      {rsvp.comment && (
                        <p className="text-gray-600 text-sm">&ldquo;{rsvp.comment}&rdquo;</p>
                      )}

                        {/* Email and reminder info */}
                        {rsvp.email && rsvp.response === 'yes' && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <span>{rsvp.email}</span>
                            {rsvp.reminder_sent_at && (
                              <span className="text-gray-500">
                                • Reminded {new Date(rsvp.reminder_sent_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          Responded {new Date(rsvp.created_at).toLocaleDateString()} at {new Date(rsvp.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteRSVP(rsvp.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {invitation.rsvps && invitation.rsvps.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No RSVPs Yet</h2>
            <p className="text-gray-600 mb-6">
              Share your invitation link to start receiving responses.
            </p>
            <button
              onClick={handleCopyInviteLink}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Copy Invite Link
            </button>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
