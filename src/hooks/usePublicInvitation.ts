import { useCallback } from 'react';
import { useApiRequest } from './useApiRequest';
import { Invitation, RSVP } from '@/lib/supabase';

export interface PublicInvitationWithData extends Invitation {
  designs?: { id: string; name: string; image_url: string };
  rsvps?: RSVP[];
}

/**
 * Custom hook for managing public invitation data (by share token)
 */
export function usePublicInvitation(token: string) {
  // Fetch invitation by share token
  const fetchInvitation = useCallback(async (): Promise<PublicInvitationWithData> => {
    const response = await fetch(`/api/invite/${token}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Invitation not found');
      }
      throw new Error('Failed to load invitation');
    }
    const data = await response.json();
    return data.invitation;
  }, [token]);

  // Submit RSVP
  const submitRSVP = useCallback(async (rsvpData: {
    invitation_id: string;
    name: string;
    response: 'yes' | 'no' | 'maybe';
    comment?: string;
    email?: string;
    notification_preferences?: { email: boolean };
  }): Promise<RSVP> => {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rsvpData),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Please fill in all required fields');
      }
      throw new Error('Failed to submit RSVP');
    }

    const data = await response.json();
    return data.rsvp;
  }, []);

  const invitationRequest = useApiRequest(fetchInvitation);
  const rsvpRequest = useApiRequest(submitRSVP);

  return {
    // Data and state
    invitation: invitationRequest.data,

    // Loading states
    loading: invitationRequest.loading,
    rsvpLoading: rsvpRequest.loading,

    // Error states
    error: invitationRequest.error,
    rsvpError: rsvpRequest.error,

    // Actions
    fetchInvitation: invitationRequest.execute,
    submitRSVP: async (rsvpData: Parameters<typeof submitRSVP>[0]) => {
      const result = await rsvpRequest.execute(rsvpData);
      // Refresh invitation to get updated RSVP list
      await invitationRequest.execute();
      return result;
    },

    // Reset functions
    reset: () => {
      invitationRequest.reset();
      rsvpRequest.reset();
    },
  };
}
