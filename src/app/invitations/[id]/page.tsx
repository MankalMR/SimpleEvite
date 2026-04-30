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
import { Edit, Eye, Trash2, Mail, Users } from 'lucide-react';
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
            <div className="bg-white rounded-md shadow-sm border p-8 mb-8">
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
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-extrabold tracking-tighter text-foreground">{invitation.title}</h1>
                  <div className="flex items-center gap-1 ml-2">
                    <Link 
                      href={`/invitations/${invitation.id}/edit`}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                      title="Edit invitation"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/invite/${invitation.share_token}`}
                      target="_blank"
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                      title="Preview guest view"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  Created {new Date(invitation.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
                <ShareLinkGroup
                  shareToken={invitation.share_token}
                  className="w-full sm:w-auto"
                />
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Time</h3>
                  <p className="text-foreground font-bold">{formatTime(invitation.event_time)}</p>
                </div>
              )}
              {invitation.rsvp_deadline && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">RSVP Deadline</h3>
                  <p className="text-foreground font-bold">{formatDisplayDate(invitation.rsvp_deadline)}</p>
                </div>
              )}


              {invitation.location && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Location</h3>
                  <p className="text-foreground font-bold">{invitation.location}</p>
                </div>
              )}

              {invitation.description && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</h3>
                  <p className="text-foreground font-medium whitespace-pre-wrap">{invitation.description}</p>
                </div>
              )}
            </div>

            {invitation.organizer_notes && (
              <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span> Organizer&apos;s Notes
                </h3>
                <p className="text-foreground/90 whitespace-pre-wrap font-medium">{invitation.organizer_notes}</p>
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
              <h2 className="text-2xl font-extrabold tracking-tighter text-foreground mb-8">RSVP Responses</h2>

              <div className="space-y-10">
                {[
                  { label: 'Attending', key: 'yes', color: 'border-green-500', icon: <Users className="w-4 h-4 text-green-500" /> },
                  { label: 'Maybe', key: 'maybe', color: 'border-yellow-500', icon: <Users className="w-4 h-4 text-yellow-500" /> },
                  { label: 'Not Attending', key: 'no', color: 'border-red-500', icon: <Users className="w-4 h-4 text-red-500" /> }
                ].map((group) => {
                  const rsvps = invitation.rsvps?.filter(r => r.response === group.key)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];
                  
                  if (rsvps.length === 0) return null;

                  return (
                    <div key={group.key} className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                        {group.icon}
                        <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">
                          {group.label} ({rsvps.length})
                        </h3>
                      </div>
                      
                      <div className="grid gap-3">
                        {rsvps.map((rsvp) => (
                          <div
                            key={rsvp.id}
                            className={`group relative p-4 rounded-md border-l-4 bg-muted/20 border-border/10 ${group.color} transition-all duration-300 hover:bg-muted/40`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <h4 className="font-bold text-foreground truncate">
                                    {rsvp.name}
                                  </h4>
                                  {rsvp.guest_count && rsvp.guest_count > 1 && (
                                    <span className="text-[10px] uppercase tracking-widest font-black px-1.5 py-0.5 bg-primary/10 text-primary rounded-sm">
                                      +{rsvp.guest_count - 1} GUEST{rsvp.guest_count > 2 ? 'S' : ''}
                                    </span>
                                  )}
                                  
                                  {rsvp.email && rsvp.response === 'yes' && (
                                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 bg-muted/50 text-muted-foreground rounded-sm">
                                      <Mail className="w-3 h-3" />
                                      {rsvp.reminder_status === 'sent' ? 'Reminded' : 'Email Saved'}
                                    </div>
                                  )}
                                </div>

                                {rsvp.comment && (
                                  <p className="text-muted-foreground text-sm font-medium italic mb-2 leading-relaxed">
                                    &ldquo;{rsvp.comment}&rdquo;
                                  </p>
                                )}

                                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                  <span>{new Date(rsvp.created_at).toLocaleDateString()}</span>
                                  {rsvp.email && (
                                    <span className="lowercase font-medium tracking-normal text-muted-foreground/40 truncate max-w-[150px]">
                                      {rsvp.email}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => deleteRSVP(rsvp.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all focus:opacity-100"
                                title="Remove RSVP"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {invitation.rsvps && invitation.rsvps.length === 0 && (
            <div className="bg-white rounded-md shadow-sm border p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No RSVPs Yet</h2>
              <p className="text-gray-600 mb-6">
                Share your invitation link to start receiving responses.
              </p>
              <ShareLinkGroup
                shareToken={invitation.share_token}
                orientation="vertical"
                className="w-full mb-4"
                copyButtonClassName="flex-1 px-6 py-3 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center gap-2"
                qrButtonClassName="sm:w-auto w-full px-6 py-3 rounded-md font-semibold transition-colors bg-gray-100 hover:bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 flex items-center justify-center gap-2"
              />
            </div>
          )}

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-border/40">
            <div className="bg-red-500/5 border border-red-500/10 rounded-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-1">Danger Zone</h3>
                <p className="text-sm text-red-600/70 font-medium">
                  Once you delete an invitation, there is no going back. Please be certain.
                </p>
              </div>
              <ConfirmDeleteButton
                onConfirm={deleteInvitation}
                label="Delete Invitation"
                confirmLabel="Are you absolutely sure?"
                className="sm:w-auto w-full"
              />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
