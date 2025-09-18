'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';
import { Invitation, RSVP } from '@/lib/supabase';

interface InvitationWithRSVPs extends Invitation {
  designs?: { id: string; name: string; image_url: string };
  rsvps?: RSVP[];
}

export default function InvitationView() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invitation, setInvitation] = useState<InvitationWithRSVPs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvitation();
    }
  }, [id]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Invitation not found');
        } else {
          setError('Failed to load invitation');
        }
        return;
      }
      const data = await response.json();
      setInvitation(data.invitation);
    } catch (err) {
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!invitation) return;
    const url = `${window.location.origin}/invite/${invitation.share_token}`;
    navigator.clipboard.writeText(url);
    alert('Invite link copied to clipboard!');
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

      // Remove RSVP from local state
      setInvitation(prev => prev ? {
        ...prev,
        rsvps: prev.rsvps?.filter(rsvp => rsvp.id !== rsvpId) || []
      } : null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete RSVP');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRSVPStats = (rsvps: RSVP[]) => {
    return rsvps.reduce(
      (acc, rsvp) => {
        acc[rsvp.response]++;
        return acc;
      },
      { yes: 0, no: 0, maybe: 0 }
    );
  };

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
              The invitation may have been deleted or you don't have permission to view it.
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{invitation.title}</h1>
            <p className="text-gray-600">
              Created {new Date(invitation.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyInviteLink}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Copy Invite Link
            </button>
            <Link
              href={`/invite/${invitation.share_token}`}
              target="_blank"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Preview
            </Link>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>

          {invitation.designs?.image_url && (
            <div className="mb-6">
              <img
                src={invitation.designs.image_url}
                alt={invitation.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Date</h3>
              <p className="text-gray-600 mb-4">{formatDate(invitation.event_date)}</p>

              {invitation.event_time && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">Time</h3>
                  <p className="text-gray-600 mb-4">{formatTime(invitation.event_time)}</p>
                </>
              )}

              {invitation.location && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">{invitation.location}</p>
                </>
              )}
            </div>

            <div>
              {invitation.description && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{invitation.description}</p>
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
              <div className="text-sm text-gray-600">Yes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{rsvpStats.maybe}</div>
              <div className="text-sm text-gray-600">Maybe</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{rsvpStats.no}</div>
              <div className="text-sm text-gray-600">No</div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
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
                          <p className="text-gray-600 text-sm">"{rsvp.comment}"</p>
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
              onClick={copyInviteLink}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Copy Invite Link
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
