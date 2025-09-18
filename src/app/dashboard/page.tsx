'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { Invitation, RSVP } from '@/lib/supabase';

interface InvitationWithRSVPs extends Invitation {
  designs?: { id: string; name: string; image_url: string };
  rsvps?: RSVP[];
}

export default function Dashboard() {
  const [invitations, setInvitations] = useState<InvitationWithRSVPs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations');
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
      const data = await response.json();
      setInvitations(data.invitations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteInvitation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invitation');
      }

      setInvitations(invitations.filter(inv => inv.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invitation');
    }
  };

  const getRSVPStats = (rsvps: RSVP[]) => {
    const stats = rsvps.reduce(
      (acc, rsvp) => {
        acc[rsvp.response]++;
        return acc;
      },
      { yes: 0, no: 0, maybe: 0 }
    );
    return stats;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const copyInviteLink = (shareToken: string) => {
    const url = `${window.location.origin}/invite/${shareToken}`;
    navigator.clipboard.writeText(url);
    alert('Invite link copied to clipboard!');
  };

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
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create New Invite
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Invitations</h3>
              <p className="text-3xl font-bold text-blue-600">{invitations.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total RSVPs</h3>
              <p className="text-3xl font-bold text-green-600">
                {invitations.reduce((acc, inv) => acc + (inv.rsvps?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Events</h3>
              <p className="text-3xl font-bold text-purple-600">
                {invitations.filter(inv => new Date(inv.event_date) >= new Date()).length}
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your First Invite
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((invitation) => {
              const rsvpStats = getRSVPStats(invitation.rsvps || []);
              const isUpcoming = new Date(invitation.event_date) >= new Date();

              return (
                <div key={invitation.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {invitation.designs?.image_url && (
                    <div className="h-48 bg-gray-100 relative">
                      <Image
                        src={invitation.designs.image_url}
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isUpcoming
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>

                    <p className="text-gray-800 text-sm mb-4 font-medium">
                      {formatDate(invitation.event_date)}
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
                        onClick={() => copyInviteLink(invitation.share_token)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Copy Link
                      </button>
                      <Link
                        href={`/invitations/${invitation.id}`}
                        className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-50 text-center transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteInvitation(invitation.id)}
                        className="border border-red-300 text-red-700 px-3 py-2 rounded text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
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
