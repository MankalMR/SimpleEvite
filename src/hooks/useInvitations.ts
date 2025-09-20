import { useCallback } from 'react';
import { useApiRequest } from './useApiRequest';
import { Invitation, RSVP } from '@/lib/supabase';

export interface InvitationWithRSVPs extends Invitation {
  designs?: { id: string; name: string; image_url: string };
  rsvps?: RSVP[];
}

/**
 * Custom hook for managing invitations data
 */
export function useInvitations() {
  // Fetch all user invitations
  const fetchInvitations = useCallback(async (): Promise<InvitationWithRSVPs[]> => {
    const response = await fetch('/api/invitations');
    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }
    const data = await response.json();
    return data.invitations;
  }, []);

  // Fetch single invitation by ID
  const fetchInvitation = useCallback(async (id: string): Promise<InvitationWithRSVPs> => {
    const response = await fetch(`/api/invitations/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Invitation not found');
      }
      throw new Error('Failed to load invitation');
    }
    const data = await response.json();
    return data.invitation;
  }, []);

  // Delete invitation
  const deleteInvitation = useCallback(async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      throw new Error('Deletion cancelled');
    }

    const response = await fetch(`/api/invitations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete invitation');
    }
  }, []);

  // Update invitation
  const updateInvitation = useCallback(async (
    id: string,
    updates: Partial<Invitation>
  ): Promise<InvitationWithRSVPs> => {
    const response = await fetch(`/api/invitations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update invitation');
    }

    const data = await response.json();
    return data.invitation;
  }, []);

  // Create new invitation
  const createInvitation = useCallback(async (
    invitationData: Omit<Invitation, 'id' | 'created_at' | 'updated_at' | 'share_token'>
  ): Promise<InvitationWithRSVPs> => {
    const response = await fetch('/api/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invitationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create invitation');
    }

    const data = await response.json();
    return data.invitation;
  }, []);

  const invitationsRequest = useApiRequest(fetchInvitations, []);
  const invitationRequest = useApiRequest(fetchInvitation);
  const deleteRequest = useApiRequest(deleteInvitation);
  const updateRequest = useApiRequest(updateInvitation);
  const createRequest = useApiRequest(createInvitation);

  return {
    // Data and state
    invitations: invitationsRequest.data || [],
    invitation: invitationRequest.data,

    // Loading states
    loading: invitationsRequest.loading,
    invitationLoading: invitationRequest.loading,
    deleteLoading: deleteRequest.loading,
    updateLoading: updateRequest.loading,
    createLoading: createRequest.loading,

    // Error states
    error: invitationsRequest.error,
    invitationError: invitationRequest.error,
    deleteError: deleteRequest.error,
    updateError: updateRequest.error,
    createError: createRequest.error,

    // Actions
    fetchInvitations: invitationsRequest.execute,
    fetchInvitation: invitationRequest.execute,
    deleteInvitation: async (id: string) => {
      await deleteRequest.execute(id);
      // Refresh invitations list after successful delete
      if (invitationsRequest.data) {
        invitationsRequest.execute();
      }
    },
    updateInvitation: updateRequest.execute,
    createInvitation: createRequest.execute,

    // Reset functions
    reset: () => {
      invitationsRequest.reset();
      invitationRequest.reset();
      deleteRequest.reset();
      updateRequest.reset();
      createRequest.reset();
    },
  };
}
