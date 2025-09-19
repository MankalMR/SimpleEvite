import { supabaseAdmin } from './supabase';
import { Invitation, Design, RSVP } from './supabase';

// Helper function to convert Supabase row to Invitation
function rowToInvitation(row: Record<string, unknown>): Invitation {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    description: row.description as string,
    event_date: row.event_date as string,
    event_time: row.event_time as string,
    location: row.location as string,
    design_id: row.design_id as string | undefined,
    share_token: row.share_token as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// Helper function to convert Supabase row to Design
function rowToDesign(row: Record<string, unknown>): Design {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    image_url: row.image_url as string,
    created_at: row.created_at as string,
  };
}

// Helper function to convert Supabase row to RSVP
function rowToRSVP(row: Record<string, unknown>): RSVP {
  return {
    id: row.id as string,
    invitation_id: row.invitation_id as string,
    name: row.name as string,
    response: row.response as 'yes' | 'no' | 'maybe',
    comment: row.comment as string | undefined,
    created_at: row.created_at as string,
  };
}

export const supabaseDb = {
  // Get all invitations for a user
  async getInvitations(userId: string): Promise<Invitation[]> {
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(rowToInvitation);
  },

  // Get a single invitation by ID
  async getInvitation(id: string, userId: string): Promise<Invitation | null> {
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return rowToInvitation(data);
  },

  // Get invitation by share token (public)
  async getInvitationByToken(token: string): Promise<Invitation | null> {
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('share_token', token)
      .single();

    if (error) return null;
    return rowToInvitation(data);
  },

  // Create a new invitation
  async createInvitation(
    invitation: Omit<Invitation, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<Invitation> {
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .insert({
        user_id: userId,
        title: invitation.title,
        description: invitation.description,
        event_date: invitation.event_date,
        event_time: invitation.event_time,
        location: invitation.location,
        design_id: invitation.design_id,
        share_token: invitation.share_token,
      })
      .select()
      .single();

    if (error) throw error;
    return rowToInvitation(data);
  },

  // Update an invitation
  async updateInvitation(
    id: string,
    updates: Partial<Invitation>,
    userId: string
  ): Promise<Invitation | null> {
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .update({
        title: updates.title,
        description: updates.description,
        event_date: updates.event_date,
        event_time: updates.event_time,
        location: updates.location,
        design_id: updates.design_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return null;
    return rowToInvitation(data);
  },

  // Delete an invitation
  async deleteInvitation(id: string, userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('invitations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  },

  // Get all designs for a user
  async getDesigns(userId: string): Promise<Design[]> {
    const { data, error } = await supabaseAdmin
      .from('designs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(rowToDesign);
  },

  // Get a single design by ID
  async getDesign(id: string, userId: string): Promise<Design | null> {
    const { data, error } = await supabaseAdmin
      .from('designs')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return rowToDesign(data);
  },

  // Create a new design
  async createDesign(
    design: Omit<Design, 'id' | 'created_at'>,
    userId: string
  ): Promise<Design> {
    const { data, error } = await supabaseAdmin
      .from('designs')
      .insert({
        user_id: userId,
        name: design.name,
        image_url: design.image_url,
      })
      .select()
      .single();

    if (error) throw error;
    return rowToDesign(data);
  },

  // Update a design
  async updateDesign(
    id: string,
    updates: Partial<Design>,
    userId: string
  ): Promise<Design | null> {
    const { data, error } = await supabaseAdmin
      .from('designs')
      .update({
        name: updates.name,
        image_url: updates.image_url,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return null;
    return rowToDesign(data);
  },

  // Delete a design
  async deleteDesign(id: string, userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('designs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  },

  // Get RSVPs for an invitation
  async getRSVPs(invitationId: string): Promise<RSVP[]> {
    const { data, error } = await supabaseAdmin
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(rowToRSVP);
  },

  // Create a new RSVP
  async createRSVP(
    rsvp: Omit<RSVP, 'id' | 'created_at'>,
    invitationId: string
  ): Promise<RSVP> {
    const { data, error } = await supabaseAdmin
      .from('rsvps')
      .insert({
        invitation_id: invitationId,
        name: rsvp.name,
        response: rsvp.response,
        comment: rsvp.comment,
      })
      .select()
      .single();

    if (error) throw error;
    return rowToRSVP(data);
  },

  // Delete an RSVP
  async deleteRSVP(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('rsvps')
      .delete()
      .eq('id', id);

    return !error;
  },
};
