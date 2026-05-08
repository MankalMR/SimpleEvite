'use client';

import { useEffect, useState } from 'react';
import { formatDisplayDate, isDateInPast } from '@/lib/date-utils';
import { getRSVPStats } from '@/lib/rsvp-utils';
import { InvitationDisplay } from '@/components/invitation-display';
import { validateRSVPForm } from '@/lib/form-utils';
import { usePublicInvitation } from '@/hooks/usePublicInvitation';
import { getInvitationDesign } from '@/lib/invitation-utils';
import { generateStructuredData } from '@/lib/seo';
import { generateGoogleMapsUrl } from '@/lib/url-utils';
import { serializeJsonLd } from '@/lib/security';
import Script from 'next/script';
import { Spinner } from '@/components/spinner';
import { InlineError } from '@/components/inline-error';
import { logger } from "@/lib/logger";
import { AddToCalendar } from '@/components/add-to-calendar';
import { PublicInvitationWithData } from '@/hooks/usePublicInvitation';

export default function PublicInvite({ 
  initialInvitation, 
  token 
}: { 
  initialInvitation: PublicInvitationWithData; 
  token: string;
}) {

  const {
    invitation,
    loading,
    error,
    rsvpLoading,
    fetchInvitation,
    submitRSVP,
  } = usePublicInvitation(token, initialInvitation);

  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [rsvpData, setRsvpData] = useState<{
    name: string;
    response: 'yes' | 'no' | 'maybe' | '';
    guest_count: number;
    comment: string;
    email: string;
    emailNotifications: boolean;
  }>({
    name: '',
    response: '',
    guest_count: 1,
    comment: '',
    email: '',
    emailNotifications: true,
  });

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token, fetchInvitation]);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Validate form
    const validation = validateRSVPForm(rsvpData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (!invitation || !rsvpData.response) return;

    try {
      setFormErrors({});
      const result = await submitRSVP({
        invitation_id: invitation.id,
        name: rsvpData.name.trim(),
        response: rsvpData.response as 'yes' | 'no' | 'maybe',
        guest_count: rsvpData.guest_count,
        comment: rsvpData.comment.trim() || undefined,
        email: rsvpData.email.trim(),
        notification_preferences: {
          email: rsvpData.emailNotifications,
        },
      });

      if (result.isUpdate) {
        setIsUpdate(true);
      } else {
        setIsUpdate(false);
      }

      setRsvpSubmitted(true);
      setShowRSVPForm(false);
      setRsvpData({ name: '', response: '', guest_count: 1, comment: '', email: '', emailNotifications: true });
    } catch (error) {
      logger.error({ error }, 'RSVP submission error:');
      setSubmissionError(error instanceof Error ? error.message : 'Failed to submit RSVP');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tighter text-foreground mb-4">
            {error || 'Invitation not found'}
          </h1>
          <p className="text-muted-foreground font-medium">
            The invitation link may be invalid, expired, or has been removed by the organizer.
          </p>
        </div>
      </div>
    );
  }


  const rsvpStats = getRSVPStats(invitation.rsvps || []);
  const eventPassed = isDateInPast(invitation.event_date);
  const deadlinePassed = invitation.rsvp_deadline ? isDateInPast(invitation.rsvp_deadline) : false;


  return (
    <>
      {/* Structured Data for SEO */}
      {invitation && (
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(generateStructuredData(invitation)),
          }}
        />
      )}

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative border-b border-border/40">
          <InvitationDisplay
            invitation={invitation}
            design={getInvitationDesign(invitation)}
            className="h-64 md:h-[450px]"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Event Details Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-8 mb-8">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-extrabold tracking-tighter text-foreground">Event Details</h2>
              {!eventPassed && <AddToCalendar invitation={invitation} />}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 rounded-md bg-muted/20 border border-border/40">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Date</h3>
                  <p className="text-foreground font-bold">{formatDisplayDate(invitation.event_date)}</p>
                </div>
              </div>

              {invitation.event_time && (
              <div className="flex items-start space-x-4 p-4 rounded-md bg-muted/20 border border-border/40">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Time</h3>
                  <p className="text-foreground font-bold">{formatTime(invitation.event_time)}</p>
                </div>
              </div>
              )}

            {invitation.location && (
              <div className="flex items-start space-x-4 p-4 rounded-md bg-muted/20 border border-border/40">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Location</h3>
                  <p className="text-foreground font-bold">{invitation.location}</p>
                  <a
                      href={generateGoogleMapsUrl(invitation.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1 mt-1"
                    >
                      View on Map
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                  </a>
                </div>
              </div>
            )}

              {invitation.organizer_notes && (
                <div className="flex items-start space-x-4 md:col-span-2 mt-4 pt-8 border-t border-border/40">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Organizer&apos;s Notes</h3>
                    <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">{invitation.organizer_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RSVP Section Card */}
          <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tighter text-foreground">RSVP</h2>
              <div className="flex space-x-4 text-[10px] uppercase tracking-widest font-bold">
                <span className="text-green-500 bg-green-500/5 px-2 py-1 rounded-md border border-green-500/10">✓ {rsvpStats.yes} Yes</span>
                <span className="text-yellow-500 bg-yellow-500/5 px-2 py-1 rounded-md border border-yellow-500/10">? {rsvpStats.maybe} Maybe</span>
                <span className="text-red-500 bg-red-500/5 px-2 py-1 rounded-md border border-red-500/10">✗ {rsvpStats.no} No</span>
              </div>
            </div>

            {rsvpSubmitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold tracking-tighter text-foreground mb-2">
                  {isUpdate ? 'Response Updated' : 'RSVP Confirmed'}
                </h3>
                <p className="text-muted-foreground font-medium">Your response has been recorded beautifully.</p>
              </div>

            ) : eventPassed ? (
              <div className="text-center py-8">
                <p className="text-gray-600">This event has already passed. RSVPs are no longer being accepted.</p>
              </div>
            ) : deadlinePassed ? (
              <div className="text-center py-8">
                <p className="text-gray-600">The RSVP deadline has passed. RSVPs are no longer being accepted.</p>
              </div>
            ) : showRSVPForm ? (

              <form onSubmit={handleRSVPSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    autoFocus
                    value={rsvpData.name}
                    onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                    className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder-muted-foreground/50"
                    placeholder="Enter your name"
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label id="rsvp-attend-label" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Will you attend? *
                  </label>
                  <div role="radiogroup" aria-labelledby="rsvp-attend-label" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['yes', 'no', 'maybe'] as const).map((response) => (
                      <button
                        key={response}
                        type="button"
                        role="radio"
                        aria-checked={rsvpData.response === response}
                        onClick={() => setRsvpData({ ...rsvpData, response })}
                        className={`px-4 py-4 rounded-md border-2 font-bold uppercase tracking-widest text-[10px] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${rsvpData.response === response
                            ? response === 'yes'
                              ? 'border-green-500 bg-green-500/5 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                              : response === 'no'
                                ? 'border-red-500 bg-red-500/5 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                : 'border-yellow-500 bg-yellow-500/5 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                            : 'border-border bg-muted/20 text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/40'
                          }`}
                      >
                        {response === 'yes' ? "Yes, I'll be there!" :
                          response === 'no' ? "Sorry, can't make it" :
                            'Maybe'}
                      </button>
                    ))}
                  </div>
                  {formErrors.response && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.response}</p>
                  )}
                </div>

                {rsvpData.response === 'yes' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="guest_count" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Total Guests (inc. you)
                    </label>
                    <input
                      type="number"
                      id="guest_count"
                      min="1"
                      max="20"
                      value={rsvpData.guest_count}
                      onChange={(e) => setRsvpData({ ...rsvpData, guest_count: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                )}

                {/* Email Section (Mandatory) */}
                <div className="border-t border-border/40 pt-8 mt-8">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={rsvpData.email}
                        onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                        className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder-muted-foreground/50"
                        placeholder="your.email@example.com"
                      />
                      {formErrors.email && (
                        <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{formErrors.email}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground/60 font-medium italic">
                        Required to verify or update your response later.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Message (Optional)
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    value={rsvpData.comment}
                    onChange={(e) => setRsvpData({ ...rsvpData, comment: e.target.value })}
                    className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder-muted-foreground/50"
                    placeholder="Any message for the host?"
                  />
                </div>

                {/* Email Notification Section - Only show if RSVP is "yes" */}
                {rsvpData.response === 'yes' && (
                  <div className="border-t border-border/40 pt-8 mt-8">
                    <div className="flex items-start mb-6">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-bold tracking-tight text-foreground">Event Reminders</h3>
                        <p className="text-xs text-muted-foreground font-medium">Receive a friendly notification 2 days before the event.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {rsvpData.email && (
                        <div className="flex items-center space-x-3 p-4 rounded-md bg-muted/20 border border-border/40">
                          <input
                            id="emailNotifications"
                            type="checkbox"
                            checked={rsvpData.emailNotifications}
                            onChange={(e) => setRsvpData({ ...rsvpData, emailNotifications: e.target.checked })}
                            className="w-5 h-5 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                          />
                          <label htmlFor="emailNotifications" className="text-sm font-bold tracking-tight text-foreground cursor-pointer">
                            Enable email reminders
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <InlineError error={submissionError} className="mb-4" />
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRSVPForm(false)}
                    className="flex-1 bg-muted/50 text-foreground px-6 py-4 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-muted transition-all shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rsvpLoading || !rsvpData.name.trim() || !rsvpData.response || !rsvpData.email.trim()}
                    className="flex-1 bg-primary text-primary-foreground px-6 py-4 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-xl shadow-primary/20"
                  >
                    {rsvpLoading && <Spinner className="-ml-1 mr-2 h-4 w-4 text-primary-foreground" />}
                    {rsvpLoading ? 'Submitting...' : 'Confirm RSVP'}
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
                  className="bg-primary text-primary-foreground px-12 py-4 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 shadow-xl shadow-primary/20"
                >
                  RSVP Now
                </button>
              </div>
            )}
          </div>

          {/* Guest List */}
          {invitation.rsvps && invitation.rsvps.length > 0 && (
            <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-8">
              <h2 className="text-3xl font-extrabold tracking-tighter text-foreground mb-8">Guest List</h2>
              <div className="space-y-4">
                {invitation.rsvps
                  .filter(rsvp => rsvp.response === 'yes')
                  .map((rsvp) => (
                    <div key={rsvp.id} className="flex items-start space-x-4 p-4 bg-muted/20 rounded-md border border-border/40">
                      <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-bold text-foreground truncate">{rsvp.name}</h4>
                          {rsvp.guest_count && rsvp.guest_count > 1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary">
                              +{rsvp.guest_count - 1} Guests
                            </span>
                          )}
                        </div>
                        {rsvp.comment && (
                          <p className="text-muted-foreground text-sm font-medium mt-1 italic">&ldquo;{rsvp.comment}&rdquo;</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
