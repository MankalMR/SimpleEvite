'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
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
                <Link
                  href="/auth/signin"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Started Free
                </Link>
              )}
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
          {!session && (
            <Link
              href="/auth/signin"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up with Google
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
