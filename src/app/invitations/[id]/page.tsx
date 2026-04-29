'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';
import { formatDisplayDate } from '@/lib/date-utils';
import { getRSVPStats } from '@/lib/rsvp-utils';
import { useInvitations } from '@/hooks/useInvitations';
import { InvitationDisplay } from '@/components/invitation-display';
import { getInvitationDesign } from '@/lib/invitation-utils';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { logger } from "@/lib/logger";
import { Edit, Eye } from 'lucide-react';
import { ShareLinkGroup } from '@/components/share-link-group';

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

  const deleteRSVP = async (rsvpId: string) => {
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
      logger.error(error instanceof Error ? error.message : 'Failed to delete RSVP');
    }
  };

  const deleteInvitation = async () => {
    if (!invitation) return;

    try {
      const response = await fetch(`/api/invitations/${invitation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invitation');
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
        <div className="max-w-4xl mx-auto py-4">
          {/* Header Card */}
          <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold tracking-tighter text-foreground mb-1">{invitation.title}</h1>
                <p className="text-muted-foreground text-sm font-medium">
                  Created {new Date(invitation.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Mobile: Stack actions vertically, Desktop: Neatly group into two rows */}
              <div className="flex flex-col gap-3 w-full sm:w-auto sm:items-end">
                {/* Primary actions - Share */}
                <ShareLinkGroup
                  shareToken={invitation.share_token}
                  className="w-full sm:w-auto"
                />

                {/* Secondary actions - Edit, Preview, Delete */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
                  <Link
                    href={`/invitations/${invitation.id}/edit`}
                    className="flex-1 sm:flex-initial bg-muted text-foreground px-4 py-2 rounded-md text-sm font-bold hover:bg-muted/80 transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-4 h-4 flex-shrink-0" />
                    Edit
                  </Link>
                  <Link
                    href={`/invite/${invitation.share_token}`}
                    target="_blank"
                    className="flex-1 sm:flex-initial bg-muted text-foreground px-4 py-2 rounded-md text-sm font-bold hover:bg-muted/80 transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    Preview
                  </Link>
                  <ConfirmDeleteButton
                    onConfirm={deleteInvitation}
                    confirmLabel="Delete permanently?"
                    className="flex-1 sm:flex-initial"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Event Details Card */}
          <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-8 mb-8">
            <h2 className="text-2xl font-extrabold tracking-tighter text-foreground mb-6">Event Details</h2>

            {/* Complete Invitation Preview */}
            <div className="mb-8">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">Invitation Preview</h3>
              <InvitationDisplay
                invitation={invitation}
                design={getInvitationDesign(invitation)}
                className="h-96 w-full rounded-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Date</h3>
                <p className="text-foreground font-bold">{formatDisplayDate(invitation.event_date)}</p>
              </div>

              {invitation.event_time && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Time</h3>
                  <p className="text-gray-800 font-medium">{formatTime(invitation.event_time)}</p>
                </div>
              )}
              {invitation.rsvp_deadline && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">RSVP Deadline</h3>
                  <p className="text-gray-800 font-medium">{formatDisplayDate(invitation.rsvp_deadline)}</p>
                </div>
              )}


              {invitation.location && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-800 font-medium">{invitation.location}</p>
                </div>
              )}

              {invitation.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-800 font-medium">{invitation.description}</p>
                </div>
              )}
            </div>

            {invitation.organizer_notes && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  📝 Organizer&apos;s Notes
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{invitation.organizer_notes}</p>
              </div>
            )}
          </div>

          {/* RSVP Stats Card */}
          <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-8 mb-8">
            <h2 className="text-2xl font-extrabold tracking-tighter text-foreground mb-6">RSVP Summary</h2>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                <div className="text-3xl font-extrabold text-green-500 mb-1">{rsvpStats.attendingCount}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-green-600/70">Attending</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <div className="text-3xl font-extrabold text-yellow-500 mb-1">{rsvpStats.maybe}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-yellow-600/70">Maybe</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="text-3xl font-extrabold text-red-500 mb-1">{rsvpStats.no}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-red-600/70">No</div>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground font-bold uppercase tracking-widest">
              Total Responses: {(invitation.rsvps || []).length}
            </div>
          </div>

          {/* RSVP List Card */}
          {invitation.rsvps && invitation.rsvps.length > 0 && (
            <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-8">
              <h2 className="text-2xl font-extrabold tracking-tighter text-foreground mb-6">All RSVPs</h2>

              <div className="space-y-4">
                {invitation.rsvps
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className={`p-4 rounded-xl border-l-4 transition-all duration-300 hover:bg-muted/30 ${rsvp.response === 'yes'
                        ? 'bg-green-500/5 border-green-500'
                        : rsvp.response === 'no'
                          ? 'bg-red-500/5 border-red-500'
                          : 'bg-yellow-500/5 border-yellow-500'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{rsvp.name}{rsvp.guest_count && rsvp.guest_count > 1 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">+{rsvp.guest_count - 1} guest{rsvp.guest_count > 2 ? "s" : ""}</span>}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${rsvp.response === 'yes'
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
                              <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${rsvp.reminder_status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : rsvp.reminder_status === 'pending'
                                  ? 'bg-gray-100 text-gray-700'
                                  : rsvp.reminder_status === 'failed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                {rsvp.reminder_status === 'sent' ? 'Sent' : rsvp.reminder_status === 'pending' ? 'Pending' : rsvp.reminder_status === 'failed' ? 'Failed' : 'None'}
                              </span>
                            )}
                          </div>
                          {rsvp.comment && (
                            <p className="text-muted-foreground text-sm font-medium italic">&ldquo;{rsvp.comment}&rdquo;</p>
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
                        <ConfirmDeleteButton
                          onConfirm={() => deleteRSVP(rsvp.id)}
                          label="Remove"
                          confirmLabel="Remove?"
                          size="sm"
                        />
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
              <ShareLinkGroup
                shareToken={invitation.share_token}
                orientation="vertical"
                className="w-full mb-4"
                copyButtonClassName="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center gap-2"
                qrButtonClassName="sm:w-auto w-full px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-100 hover:bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 flex items-center justify-center gap-2"
              />
            </div>
          )}
        </div>
      </ProtectedRoute>
    );
  }
