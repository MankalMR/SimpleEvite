import { Invitation, Design, RSVP } from './supabase';

/**
 * Unified API client for all Simple Evite API calls
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Invitation endpoints
  async getInvitations(): Promise<Invitation[]> {
    const data = await this.request<{ invitations: Invitation[] }>('/api/invitations');
    return data.invitations;
  }

  async getInvitation(id: string): Promise<Invitation> {
    const data = await this.request<{ invitation: Invitation }>(`/api/invitations/${id}`);
    return data.invitation;
  }

  async getPublicInvitation(token: string): Promise<Invitation> {
    const data = await this.request<{ invitation: Invitation }>(`/api/invite/${token}`);
    return data.invitation;
  }

  async createInvitation(invitationData: Partial<Invitation>): Promise<Invitation> {
    const data = await this.request<{ invitation: Invitation }>('/api/invitations', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
    return data.invitation;
  }

  async updateInvitation(id: string, updates: Partial<Invitation>): Promise<Invitation> {
    const data = await this.request<{ invitation: Invitation }>(`/api/invitations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.invitation;
  }

  async deleteInvitation(id: string): Promise<void> {
    await this.request(`/api/invitations/${id}`, {
      method: 'DELETE',
    });
  }

  // Design endpoints
  async getDesigns(): Promise<Design[]> {
    const data = await this.request<{ designs: Design[] }>('/api/designs');
    return data.designs;
  }

  async deleteDesign(id: string): Promise<void> {
    await this.request(`/api/designs/${id}`, {
      method: 'DELETE',
    });
  }

  // RSVP endpoints
  async createRSVP(rsvpData: {
    invitation_id: string;
    name: string;
    response: 'yes' | 'no' | 'maybe';
    comment?: string;
  }): Promise<RSVP> {
    const data = await this.request<{ rsvp: RSVP }>('/api/rsvp', {
      method: 'POST',
      body: JSON.stringify(rsvpData),
    });
    return data.rsvp;
  }

  // File upload endpoint
  async uploadFile(file: File): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };
