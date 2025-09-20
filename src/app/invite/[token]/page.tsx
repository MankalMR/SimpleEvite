'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { RSVP } from '@/lib/supabase';
import { formatDisplayDate, isDateInPast } from '@/lib/date-utils';
import { getTextOverlayConfig, getTextOverlayContainerClasses, getTextOverlayContentClasses, getTextOverlayTitleClasses, getTextOverlayDescriptionClasses, getTextOverlayBackgroundClasses, getTextOverlayBackgroundStyles } from '@/lib/text-overlay-utils';
import { getRSVPStats, sortRSVPsByDate, getRSVPResponseColorClasses } from '@/lib/rsvp-utils';
import { validateRSVPForm } from '@/lib/form-utils';
import { usePublicInvitation } from '@/hooks/usePublicInvitation';

export default function PublicInvite() {
  const params = useParams();
  const token = params.token as string;

  const {
    invitation,
    loading,
    error,
    rsvpLoading,
    rsvpError,
    fetchInvitation,
    submitRSVP,
  } = usePublicInvitation(token);

  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpData, setRsvpData] = useState<{
    name: string;
    response: 'yes' | 'no' | 'maybe' | '';
    comment: string;
  }>({
    name: '',
    response: '',
    comment: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token, fetchInvitation]);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateRSVPForm(rsvpData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (!invitation || !rsvpData.response) return;

    try {
      setFormErrors({});
      await submitRSVP({
        invitation_id: invitation.id,
        name: rsvpData.name.trim(),
        response: rsvpData.response as 'yes' | 'no' | 'maybe',
        comment: rsvpData.comment.trim() || undefined,
      });

      setRsvpSubmitted(true);
      setShowRSVPForm(false);
      setRsvpData({ name: '', response: '', comment: '' });
    } catch (error) {
      console.error('RSVP submission error:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit RSVP');
    }
  };

  // Removed formatDate function - now using utility from date-utils

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
      const eventPassed = isDateInPast(invitation.event_date);

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
          /* No Design - Beautiful Gradient Background with Text Overlay */
          (() => {
            // Create beautiful gradient backgrounds for when no design is selected
            const gradientBackgrounds = [
              'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500',
              'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500',
              'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600',
              'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500',
              'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500',
              'bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600'
            ];

            // Select gradient based on text style for consistency
            const getGradientForStyle = (style: string) => {
              switch (style) {
                case 'vibrant': return gradientBackgrounds[0]; // Purple-pink-red
                case 'elegant': return gradientBackgrounds[1]; // Blue-purple-pink
                case 'bold': return gradientBackgrounds[2]; // Green-blue-purple
                case 'light': return gradientBackgrounds[4]; // Indigo-purple-pink
                case 'dark': return gradientBackgrounds[5]; // Teal-blue-indigo
                case 'muted': return gradientBackgrounds[3]; // Yellow-red-pink
                default: return gradientBackgrounds[0];
              }
            };

            const textConfig = getTextOverlayConfig(invitation);
            const containerClasses = getTextOverlayContainerClasses(textConfig);
            const contentClasses = getTextOverlayContentClasses(textConfig);
            const titleClasses = getTextOverlayTitleClasses(textConfig);
            const descriptionClasses = getTextOverlayDescriptionClasses(textConfig);
            const backgroundClasses = getTextOverlayBackgroundClasses(textConfig);
            const backgroundStyles = getTextOverlayBackgroundStyles(textConfig);

            return (
              <div className={`h-96 relative ${getGradientForStyle(invitation.text_overlay_style || 'vibrant')}`}>
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
              </div>
            );
          })()
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
                <p className="text-gray-600">{formatDisplayDate(invitation.event_date)}</p>
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
                      {response === 'yes' ? 'Yes, I&apos;ll be there!' :
                       response === 'no' ? 'Sorry, can&apos;t make it' :
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Who&apos;s Coming</h2>
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
                        <p className="text-gray-600 text-sm mt-1">&ldquo;{rsvp.comment}&rdquo;</p>
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
