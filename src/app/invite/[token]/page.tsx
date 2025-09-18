'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Invitation, RSVP } from '@/lib/supabase';

interface InvitationWithRSVPs extends Invitation {
  designs?: { id: string; name: string; image_url: string };
  rsvps?: RSVP[];
}

export default function PublicInvite() {
  const params = useParams();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationWithRSVPs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpData, setRsvpData] = useState({
    name: '',
    response: '' as 'yes' | 'no' | 'maybe' | '',
    comment: '',
  });

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invite/${token}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Invitation not found');
        } else {
          setError('Failed to load invitation');
        }
        return;
      }
      const data = await response.json();
      console.log('Invitation data:', data.invitation); // Debug log
      setInvitation(data.invitation);
    } catch (err) {
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpLoading(true);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitation_id: invitation?.id,
          name: rsvpData.name.trim(),
          response: rsvpData.response,
          comment: rsvpData.comment.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit RSVP');
      }

      const data = await response.json();

      // Add the new RSVP to the invitation
      setInvitation(prev => prev ? {
        ...prev,
        rsvps: [...(prev.rsvps || []), data.rsvp]
      } : null);

      setRsvpSubmitted(true);
      setShowRSVPForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit RSVP');
    } finally {
      setRsvpLoading(false);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Invitation not found'}
          </h1>
          <p className="text-gray-600">
            The invitation link may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  const rsvpStats = getRSVPStats(invitation.rsvps || []);
  const eventPassed = new Date(invitation.event_date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        {invitation.designs && invitation.designs.image_url ? (
          <div className="h-64 md:h-96 relative overflow-hidden">
            <Image
              src={invitation.designs.image_url}
              alt={invitation.title}
              fill
              className="object-cover"
              onLoad={() => {
                console.log('Image loaded successfully:', invitation.designs?.image_url);
              }}
              onError={(e) => {
                console.error('Image failed to load:', invitation.designs?.image_url);
                console.error('Error details:', e);
              }}
              priority
              unoptimized={true}
            />
            {/* No overlay - pure background image */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                  {invitation.title}
                </h1>
                {invitation.description && (
                  <p className="text-lg md:text-xl max-w-2xl mx-auto text-white drop-shadow-lg">
                    {invitation.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">
                {invitation.title}
              </h1>
              {invitation.description && (
                <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-600">
                  {invitation.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Date</h3>
                <p className="text-gray-600">{formatDate(invitation.event_date)}</p>
              </div>
            </div>

            {invitation.event_time && (
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Time</h3>
                  <p className="text-gray-600">{formatTime(invitation.event_time)}</p>
                </div>
              </div>
            )}

            {invitation.location && (
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Location</h3>
                  <p className="text-gray-600">{invitation.location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RSVP Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">RSVP</h2>
            <div className="flex space-x-4 text-sm">
              <span className="text-green-600 font-medium">✓ {rsvpStats.yes} Yes</span>
              <span className="text-yellow-600 font-medium">? {rsvpStats.maybe} Maybe</span>
              <span className="text-red-600 font-medium">✗ {rsvpStats.no} No</span>
            </div>
          </div>

          {rsvpSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you for your RSVP!</h3>
              <p className="text-gray-600">Your response has been recorded.</p>
            </div>
          ) : eventPassed ? (
            <div className="text-center py-8">
              <p className="text-gray-600">This event has already passed. RSVPs are no longer being accepted.</p>
            </div>
          ) : showRSVPForm ? (
            <form onSubmit={handleRSVPSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={rsvpData.name}
                  onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Will you attend? *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['yes', 'no', 'maybe'] as const).map((response) => (
                    <button
                      key={response}
                      type="button"
                      onClick={() => setRsvpData({ ...rsvpData, response })}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        rsvpData.response === response
                          ? response === 'yes'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : response === 'no'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {response === 'yes' ? 'Yes, I\'ll be there!' :
                       response === 'no' ? 'Sorry, can\'t make it' :
                       'Maybe'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-semibold text-gray-900 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  value={rsvpData.comment}
                  onChange={(e) => setRsvpData({ ...rsvpData, comment: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  placeholder="Any message for the host?"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRSVPForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rsvpLoading || !rsvpData.name.trim() || !rsvpData.response}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {rsvpLoading ? 'Submitting...' : 'Submit RSVP'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Please let us know if you can attend this event.
              </p>
              <button
                onClick={() => setShowRSVPForm(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                RSVP Now
              </button>
            </div>
          )}
        </div>

        {/* Guest List */}
        {invitation.rsvps && invitation.rsvps.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Who's Coming</h2>
            <div className="space-y-4">
              {invitation.rsvps
                .filter(rsvp => rsvp.response === 'yes')
                .map((rsvp) => (
                  <div key={rsvp.id} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{rsvp.name}</h4>
                      {rsvp.comment && (
                        <p className="text-gray-600 text-sm mt-1">"{rsvp.comment}"</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
