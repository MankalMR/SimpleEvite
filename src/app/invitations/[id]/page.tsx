'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { formatDisplayDate } from '@/lib/date-utils';
import { RSVP } from '@/lib/supabase';
import { getRSVPStats, sortRSVPsByDate, getRSVPResponseColorClasses } from '@/lib/rsvp-utils';
import { copyInviteLink } from '@/lib/clipboard-utils';
import { useInvitations } from '@/hooks/useInvitations';
import { getTextOverlayConfig, getTextOverlayContainerClasses, getTextOverlayContentClasses, getTextOverlayTitleClasses, getTextOverlayDescriptionClasses, getTextOverlayBackgroundClasses, getTextOverlayBackgroundStyles } from '@/lib/text-overlay-utils';

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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{invitation.title}</h1>
                <p className="text-gray-700 font-medium">
                  Created {new Date(invitation.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">
            <button
              onClick={handleCopyInviteLink}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Copy Invite Link
            </button>
            <Link
              href={`/invitations/${invitation.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Edit
            </Link>
            <Link
              href={`/invite/${invitation.share_token}`}
              target="_blank"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Preview
            </Link>
                <button
                  onClick={deleteInvitation}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
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
            {invitation.designs?.image_url ? (
              <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src={invitation.designs.image_url}
                  alt={invitation.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Text overlay with customizable styling */}
                {(() => {
                  const textConfig = getTextOverlayConfig(invitation);
                  const containerClasses = getTextOverlayContainerClasses(textConfig);
                  const contentClasses = getTextOverlayContentClasses(textConfig);
                  const titleClasses = getTextOverlayTitleClasses(textConfig);
                  const descriptionClasses = getTextOverlayDescriptionClasses(textConfig);
                  const backgroundClasses = getTextOverlayBackgroundClasses(textConfig);
                  const backgroundStyles = getTextOverlayBackgroundStyles(textConfig);

                  return (
                    <div className={containerClasses}>
                      {textConfig.background && (
                        <div
                          className={`absolute inset-0 ${backgroundClasses}`}
                          style={backgroundStyles}
                        />
                      )}
                      <div className={contentClasses}>
                        <h1 className={titleClasses}>
                          {invitation.title}
                        </h1>
                        {invitation.description && (
                          <p className={descriptionClasses}>
                            {invitation.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 rounded-lg">
                <div className="text-center px-4">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    {invitation.title}
                  </h1>
                  {invitation.description && (
                    <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-700">
                      {invitation.description}
                    </p>
                  )}
                </div>
              </div>
            )}
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
                        </div>
                      {rsvp.comment && (
                        <p className="text-gray-600 text-sm">&ldquo;{rsvp.comment}&rdquo;</p>
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
