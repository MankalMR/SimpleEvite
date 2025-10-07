import { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'About Simple Evite - The Story Behind Beautiful Event Invitations',
  description: 'Learn about the inspiration behind Simple Evite, a modern solution for creating beautiful event invitations. Discover how we&apos;re making event planning more accessible and elegant.',
  keywords: ['about simple evite', 'event invitation story', 'invitation platform history', 'event planning tools', 'digital invitations'],
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About Simple Evite
            </h1>
            <p className="text-xl text-gray-600">
              The story behind creating beautiful, accessible event invitations
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Inspiration</h2>
              <p className="text-gray-700 mb-4">
                Simple Evite was born from a simple observation: creating beautiful event invitations shouldn&apos;t be complicated or expensive.
                As someone who has organized numerous events, I noticed that existing solutions were either too complex, too expensive,
                or lacked the personal touch that makes an invitation special.
              </p>
              <p className="text-gray-700 mb-4">
                Whether it was a birthday party, corporate event, or casual gathering, I found myself spending hours trying to create
                something that looked professional and captured the essence of the event. The available tools either required design
                expertise I didn&apos;t have or charged premium prices for basic functionality.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Vision</h2>
              <p className="text-gray-700 mb-4">
                I envisioned a platform that would democratize beautiful event invitations. A tool that would allow anyone, regardless
                of their design skills or budget, to create stunning invitations that reflect their personal style and the nature of
                their event.
              </p>
              <p className="text-gray-700 mb-4">
                The goal was to make event planning more accessible while maintaining the elegance and personal touch that makes
                invitations meaningful. Simple Evite combines the best of both worlds: professional design templates with the
                flexibility to customize and make each invitation unique.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Makes Us Different</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Simplicity First</h3>
                  <p className="text-gray-700">
                    We believe that creating beautiful invitations should be intuitive and straightforward.
                    No complex design software or steep learning curves.
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Touch</h3>
                  <p className="text-gray-700">
                    Upload your own images, customize text styles, and create invitations that truly
                    represent your event and personality.
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hidden Costs</h3>
                  <p className="text-gray-700">
                    All core features are free to use. We believe everyone deserves access to
                    beautiful event invitations without breaking the bank.
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Modern Technology</h3>
                  <p className="text-gray-700">
                    Built with the latest web technologies to ensure fast, reliable, and
                    mobile-friendly experiences for all users.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Journey</h2>
              <p className="text-gray-700 mb-4">
                Building Simple Evite has been a journey of learning, iterating, and constantly improving.
                Every feature is designed with real user needs in mind, from the intuitive template selection
                to the seamless RSVP tracking system.
              </p>
              <p className="text-gray-700 mb-4">
                We&apos;re committed to continuously evolving the platform based on user feedback and the changing
                needs of event organizers. Our goal is to make Simple Evite the go-to solution for anyone
                who wants to create memorable, beautiful event invitations.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Looking Forward</h2>
              <p className="text-gray-700 mb-4">
                Simple Evite is more than just a tool—it&apos;s a platform that brings people together.
                Every invitation created is a step toward making someone&apos;s special event even more memorable.
              </p>
              <p className="text-gray-700 mb-6">
                We&apos;re excited about the future and the many ways we can continue to improve the event
                invitation experience. Whether you&apos;re planning a small gathering or a large celebration,
                we&apos;re here to help you create something beautiful.
              </p>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Create Your First Invitation?</h3>
              <p className="text-gray-700 mb-4">
                Join the growing community of event organizers who trust Simple Evite for their special occasions.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}