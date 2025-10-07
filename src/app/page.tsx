'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [, setHasInvitations] = useState(false);
  const [checkedInvitations, setCheckedInvitations] = useState(false);

  const checkUserInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/invitations');
      if (response.ok) {
        const data = await response.json();
        const invitations = data.invitations || [];
        setHasInvitations(invitations.length > 0);

        // Redirect to dashboard if user has invitations
        if (invitations.length > 0) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking invitations:', error);
    } finally {
      setLoading(false);
      setCheckedInvitations(true);
    }
  }, [router, setHasInvitations]);

  // Check if user has invitations and redirect to dashboard
  useEffect(() => {
    if (session && !checkedInvitations) {
      checkUserInvitations();
    }
  }, [session, checkedInvitations, checkUserInvitations]);

  const handleGoogleSignIn = async () => {
    setSignInLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Error signing in:', error);
      setSignInLoading(false);
    }
  };

  // Show loading state while checking for existing invitations
  if (session && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/sEvite.png"
                alt="Simple Evite Logo"
                width={80}
                height={80}
                className="rounded-2xl shadow-lg"
              />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Create Beautiful
              <span className="block text-blue-600">Event Invitations</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Design stunning invitations, track RSVPs, and manage your events with ease.
              No complex setup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <>
                  <Link
                    href="/create"
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Invite
                  </Link>
                  <Link
                    href="/dashboard"
                    className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    View Dashboard
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={signInLoading}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[280px]"
                >
                  {signInLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Signing you in...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Additional Navigation Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/features"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for perfect events
            </h2>
            <p className="text-lg text-gray-600">
              Simple, powerful tools to create and manage your invitations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Designs</h3>
              <p className="text-gray-600">
                Upload your own images or choose from beautiful templates. Save and reuse your favorite designs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy RSVP Tracking</h3>
              <p className="text-gray-600">
                Guests can RSVP without creating accounts. Track responses and comments in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Anywhere</h3>
              <p className="text-gray-600">
                Get a unique link for each invitation. Share via text, email, social media, or any messaging app.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to create your first invitation?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust Simple Evite for their events
          </p>
          {session ? (
            <Link
              href="/create"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Your First Invite
            </Link>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={signInLoading}
              className="bg-white text-slate-700 px-8 py-4 rounded-2xl text-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[280px] border border-gray-200 mx-auto"
            >
              {signInLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-700"></div>
                  Signing you in...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Simple Footer */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Image
                src="/sEvite.png"
                alt="Simple Evite Logo"
                width={32}
                height={32}
                className="rounded-lg mr-3"
              />
              <span className="text-white font-semibold">Simple Evite</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/features"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Simple Evite. All rights reserved.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
