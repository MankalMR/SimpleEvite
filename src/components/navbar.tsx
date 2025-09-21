'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  const { data: session, status } = useSession();

  const handleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand - Always prioritized, never compressed */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 min-w-0">
              <Image
                src="/sEvite.png"
                alt="Simple Evite Logo"
                width={32}
                height={32}
                className="rounded-lg flex-shrink-0"
              />
              <span className="font-semibold text-lg sm:text-xl text-gray-900 truncate">
                Simple Evite
              </span>
            </Link>
          </div>

          {/* User Actions - Responsive, gets compressed on mobile */}
          <div className="flex items-center flex-shrink min-w-0">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="relative group">
                {/* Mobile-first user menu button */}
                <button className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md transition-colors min-w-0">
                  <Image
                    src={session.user?.image || '/placeholder-avatar.svg'}
                    alt={session.user?.name || 'User'}
                    width={28}
                    height={28}
                    className="rounded-full flex-shrink-0 sm:w-8 sm:h-8"
                  />
                  {/* Hide name on very small screens, show on sm+ */}
                  <span className="hidden sm:block text-sm font-medium truncate max-w-[120px] lg:max-w-none">
                    {session.user?.name}
                  </span>
                  {/* Show initials on mobile instead of name */}
                  <span className="sm:hidden text-sm font-medium">
                    {session.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {/* Show full name in dropdown on mobile */}
                  <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                    {session.user?.name}
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/designs"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Designs
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="hidden sm:block">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
