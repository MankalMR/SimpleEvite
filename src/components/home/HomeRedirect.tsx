'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { logger } from "@/lib/logger";

export default function HomeRedirect() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkedInvitations, setCheckedInvitations] = useState(false);

  const checkUserInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/invitations');
      if (response.ok) {
        const data = await response.json();
        const invitations = data.invitations || [];
        
        // Redirect to dashboard if user has invitations
        if (invitations.length > 0) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error checking invitations:');
    } finally {
      setLoading(false);
      setCheckedInvitations(true);
    }
  }, [router]);

  useEffect(() => {
    if (session && !checkedInvitations) {
      checkUserInvitations();
    }
  }, [session, checkedInvitations, checkUserInvitations]);

  if (session && loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your invitations...</p>
        </div>
      </div>
    );
  }

  return null;
}
