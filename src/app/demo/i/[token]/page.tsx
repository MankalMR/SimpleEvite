'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { formatDisplayDate, isDateInPast } from '@/lib/date-utils';
import { InvitationDisplay } from '@/components/invitation-display';
import { validateRSVPForm } from '@/lib/form-utils';
import { getInvitationDesign } from '@/lib/invitation-utils';
import { getRSVPStats } from '@/lib/rsvp-utils';
import { generateGoogleMapsUrl } from '@/lib/url-utils';
import { DemoBanner } from '@/components/DemoBanner';
import { Spinner } from '@/components/spinner';
import { InvitationWithRSVPs } from '@/lib/database-supabase';
import { InlineError } from '@/components/inline-error';
import { AddToCalendar } from '@/components/add-to-calendar';

export default function DemoPublicInvite() {
    const params = useParams();
    const token = params.token as string;

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [invitation, setInvitation] = useState<InvitationWithRSVPs | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rsvpLoading, setRsvpLoading] = useState(false);
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
    }>({
        name: '',
        response: '',
        guest_count: 1,
        comment: '',
        email: '',
    });

    // Initialize session
    useEffect(() => {
        const stored = localStorage.getItem('demoSessionId');
        if (stored) {
            setSessionId(stored);
        } else {
            fetch('/api/demo/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
                .then(res => res.json())
                .then(data => {
                    localStorage.setItem('demoSessionId', data.sessionId);
                    setSessionId(data.sessionId);
                })
                .catch(() => setError('Failed to initialize demo session'));
        }
    }, []);

    // Fetch invitation by share token
    const fetchInvitation = useCallback(async () => {
        if (!sessionId || !token) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/demo/invite/${token}`, {
                headers: { 'x-demo-session-id': sessionId },
            });
            if (!res.ok) {
                setError('Invitation not found');
                return;
            }
            const data = await res.json();
            setInvitation(data.invitation);
        } catch {
            setError('Failed to load invitation');
        } finally {
            setLoading(false);
        }
    }, [sessionId, token]);

    useEffect(() => {
        fetchInvitation();
    }, [fetchInvitation]);

    const handleRSVPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);
        if (!invitation || !sessionId || !rsvpData.response) return;

        const validation = validateRSVPForm(rsvpData);
        if (!validation.isValid) {
            setFormErrors(validation.errors);
            return;
        }

        setRsvpLoading(true);
        setFormErrors({});
        try {
            const res = await fetch('/api/demo/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-demo-session-id': sessionId,
                },
                body: JSON.stringify({
                    invitation_id: invitation.id,
                    name: rsvpData.name.trim(),
                    response: rsvpData.response,
                    guest_count: rsvpData.guest_count,
                    comment: rsvpData.comment.trim() || undefined,
                    email: rsvpData.email.trim(),
                }),
            });

            const data = await res.json();
            if (data.isUpdate) {
                setIsUpdate(true);
            } else {
                setIsUpdate(false);
            }

            if (!res.ok) {
                throw new Error('Failed to submit RSVP');
            }

            setRsvpSubmitted(true);
            setShowRSVPForm(false);
            setRsvpData({ name: '', response: '', guest_count: 1,
        comment: '',
        email: '',
    });
            // Refresh to see new RSVP
            fetchInvitation();
        } catch {
            setSubmissionError('Failed to submit RSVP');
        } finally {
            setRsvpLoading(false);
        }
    };

    const formatTime = (timeString: string) =>
        new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

    const handleReset = () => {
        window.location.href = '/demo/dashboard';
    };

    if (loading) {
        return (
            <>
                <DemoBanner onReset={handleReset} />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </>
        );
    }

    if (error || !invitation) {
        return (
            <>
                <DemoBanner onReset={handleReset} />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Invitation not found'}</h1>
                        <p className="text-gray-600">The invitation link may be invalid or expired.</p>
                    </div>
                </div>
            </>
        );
    }


  const rsvpStats = getRSVPStats(invitation.rsvps || []);
  const eventPassed = isDateInPast(invitation.event_date);
  const deadlinePassed = invitation.rsvp_deadline ? isDateInPast(invitation.rsvp_deadline) : false;


    return (
        <>
            <DemoBanner onReset={handleReset} />
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="relative">
                    <InvitationDisplay
                        invitation={invitation}
                        design={getInvitationDesign(invitation)}
                        className="h-64 md:h-96"
                    />
                </div>

                {/* Event Details */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
                            {!eventPassed && <AddToCalendar invitation={invitation} />}
                        </div>
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
                                <div className="flex items-start space-x-3 md:col-span-2 mt-2 pt-6 border-t border-gray-100">
                                    <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">Organizer&apos;s Notes</h3>
                                        <p className="text-gray-600 whitespace-pre-wrap mt-1">{invitation.organizer_notes}</p>
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
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{isUpdate ? 'Your RSVP has been updated!' : 'Your RSVP has been confirmed!'}</h3>
                                <p className="text-gray-600">Your response has been recorded.</p>
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
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        autoFocus
                                        value={rsvpData.name}
                                        onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                                        placeholder="Enter your name"
                                    />
                                    {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                                </div>

                                <div>
                                    <label id="rsvp-attend-label" className="block text-sm font-semibold text-gray-900 mb-3">Will you attend? *</label>
                                    <div role="radiogroup" aria-labelledby="rsvp-attend-label" className="grid grid-cols-3 gap-3">
                                        {(['yes', 'no', 'maybe'] as const).map((response) => (
                                            <button
                                                key={response}
                                                type="button"
                                                role="radio"
                                                aria-checked={rsvpData.response === response}
                                                onClick={() => setRsvpData({ ...rsvpData, response })}
                                                className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${rsvpData.response === response
                                                    ? response === 'yes'
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : response === 'no'
                                                            ? 'border-red-500 bg-red-50 text-red-700'
                                                            : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                                    }`}
                                            >
                                                {response === 'yes' ? "Yes, I'll be there!" :
                                                    response === 'no' ? "Sorry, can't make it" :
                                                        'Maybe'}
                                            </button>
                                        ))}
                                    </div>
                                    {formErrors.response && <p className="mt-1 text-sm text-red-600">{formErrors.response}</p>}
                                </div>
                                {rsvpData.response === 'yes' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label htmlFor="guest_count" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Number of Guests (including yourself)
                                        </label>
                                        <input
                                            type="number"
                                            id="guest_count"
                                            min="1"
                                            max="20"
                                            value={rsvpData.guest_count}
                                            onChange={(e) => setRsvpData({ ...rsvpData, guest_count: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                )}



                                {/* Email Section */}
                                <div className="border-t border-gray-200 pt-6 mt-6 mb-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                value={rsvpData.email}
                                                onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                                                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                                                placeholder="your.email@example.com"
                                            />
                                            {formErrors.email && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                            )}
                                            <p className="mt-1.5 text-xs text-gray-500">
                                                We use your email to let you update your RSVP later.
                                            </p>
                                        </div>
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

                                <InlineError error={submissionError} className="mb-4" />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRSVPForm(false)}
                                        className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={rsvpLoading || !rsvpData.name.trim() || !rsvpData.response || !rsvpData.email.trim()}
                                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                    >
                                        {rsvpLoading && <Spinner className="-ml-1 mr-2 h-5 w-5 text-white" />}
                                        {rsvpLoading ? 'Submitting...' : 'Submit RSVP'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-600 mb-6">Please let us know if you can attend this event.</p>
                                <button
                                    onClick={() => setShowRSVPForm(true)}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
                                                <h4 className="font-semibold text-gray-900">{rsvp.name}{rsvp.guest_count && rsvp.guest_count > 1 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">+{rsvp.guest_count - 1} guest{rsvp.guest_count > 2 ? "s" : ""}</span>}</h4>
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
        </>
    );
}
