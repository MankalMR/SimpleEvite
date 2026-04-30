import { supabaseAdmin } from './supabase';
import { Invitation, Design, RSVP, DefaultTemplate } from './supabase';
import { logger } from "@/lib/logger";

// Extended Invitation interface for database operations with nested data
export interface InvitationWithRSVPs extends Invitation {
  rsvps?: RSVP[];
  designs?: Design;
  default_templates?: DefaultTemplate;
}

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
    hide_title: row.hide_title as boolean | undefined,
    hide_description: row.hide_description as boolean | undefined,
    organizer_notes: row.organizer_notes as string | undefined,
    text_font_family: row.text_font_family as 'inter' | 'playfair' | 'lora' | 'pacifico' | 'oswald' | undefined,
    // Text overlay styling options
    text_overlay_style: row.text_overlay_style as 'light' | 'dark' | 'vibrant' | 'muted' | 'elegant' | 'bold' | undefined,
    text_position: row.text_position as 'center' | 'top' | 'bottom' | 'left' | 'right' | undefined,
    text_size: row.text_size as 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' | undefined,
    text_shadow: row.text_shadow as boolean | undefined,
    text_background: row.text_background as boolean | undefined,
    text_background_opacity: row.text_background_opacity as number | undefined,
  };
}

// Helper function to convert Supabase row with nested RSVPs and Designs to Invitation (Synchronous)
function rowToInvitationWithRSVPsSync(row: Record<string, unknown>): InvitationWithRSVPs {
  const invitation = rowToInvitation(row);
  const result: InvitationWithRSVPs = {
    ...invitation,
    rsvps: (row.rsvps as Record<string, unknown>[])?.map(rowToRSVP) || [],
  };

  // The nested 'designs' relation is now mapped directly via INVITATION_FULL_SELECT
  if (row.designs) {
    result.designs = rowToDesign(row.designs as Record<string, unknown>);
  }

  return result;
}

// ⚡ Bolt: Fast O(1) bulk fetch for missing designs and default_templates
async function enrichInvitationsWithTemplates(invitations: InvitationWithRSVPs[]): Promise<InvitationWithRSVPs[]> {
  const missingDesignIds = Array.from(new Set(
    invitations
      .filter(inv => inv.design_id && !inv.designs && !inv.default_templates)
      .map(inv => inv.design_id as string)
  ));

  if (missingDesignIds.length === 0) {
    return invitations;
  }

  try {
    // 1. Try fetching from custom designs
    const { data: designData, error: designError } = await supabaseAdmin
      .from('designs')
      .select('*')
      .in('id', missingDesignIds);

    // 2. Try fetching from default templates
    const { data: templateData, error: templateError } = await supabaseAdmin
      .from('default_templates')
      .select('*')
      .in('id', missingDesignIds);

    const designDict: Record<string, Design> = {};
    for (const d of designData || []) designDict[d.id] = rowToDesign(d);

    const templateDict: Record<string, DefaultTemplate> = {};
    for (const t of templateData || []) templateDict[t.id] = rowToDefaultTemplate(t);

    return invitations.map(inv => {
      if (inv.design_id) {
        if (designDict[inv.design_id]) {
          return { ...inv, designs: designDict[inv.design_id] };
        } else if (templateDict[inv.design_id]) {
          return { ...inv, default_templates: templateDict[inv.design_id] };
        }
      }
      return inv;
    });
  } catch (error) {
    logger.error({ error }, 'Unexpected error enriching templates/designs:');
    return invitations;
  }
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

// Helper function to convert Supabase row to DefaultTemplate
function rowToDefaultTemplate(row: Record<string, unknown>): DefaultTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    occasion: row.occasion as 'birthday' | 'christmas' | 'new-year' | 'thanksgiving' | 'diwali' | 'satyanarayan' | 'housewarming',
    theme: row.theme as 'elegant' | 'vibrant' | 'modern',
    image_url: row.image_url as string,
    thumbnail_url: row.thumbnail_url as string | undefined,
    description: row.description as string | undefined,
    tags: row.tags as string[] || [],
    is_active: row.is_active as boolean,
    sort_order: row.sort_order as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
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
    email: row.email as string | undefined,
    notification_preferences: row.notification_preferences as { email: boolean } | undefined,
    reminder_status: row.reminder_status as 'pending' | 'sent' | 'failed' | 'skipped' | undefined,
    created_at: row.created_at as string,
  };
}

// Reusable query fragments
const INVITATION_BASE_SELECT = `*`;

// Removed unused select constants - using INVITATION_FULL_SELECT instead

const INVITATION_FULL_SELECT = `
  ${INVITATION_BASE_SELECT},
  rsvps (
    id,
    name,
    response,
    comment,
    email,
    notification_preferences,
    reminder_status,
    created_at
  )
`;

export const supabaseDb = {
  // Get all invitations for a user with RSVP data and designs
  async getInvitations(userId: string): Promise<InvitationWithRSVPs[]> {
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .select(INVITATION_FULL_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // ⚡ Bolt: Map synchronously, then enrich with templates in O(1)
    const baseInvitations = data.map(rowToInvitationWithRSVPsSync);
    return enrichInvitationsWithTemplates(baseInvitations);
  },

  // Get a single invitation by ID with RSVP data and designs (for owner)
  async getInvitation(id: string, userId: string): Promise<InvitationWithRSVPs | null> {
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .select(INVITATION_FULL_SELECT)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // ⚡ Bolt: Map synchronously, wrap in array to enrich, return single
    const baseInvitation = rowToInvitationWithRSVPsSync(data);
    const enriched = await enrichInvitationsWithTemplates([baseInvitation]);
    return enriched[0];
  },

  // Get invitation by share token (public) - with full data including designs and RSVPs
  async getInvitationByToken(token: string): Promise<InvitationWithRSVPs | null> {
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .select(INVITATION_FULL_SELECT)
      .eq('share_token', token)
      .single();

    if (error) {
      logger.error({ error }, 'Error fetching invitation by token:');
      return null;
    }

    logger.info({ data }, 'Raw invitation data from Supabase (public):');

    // ⚡ Bolt: Map synchronously, wrap in array to enrich, return single
    const baseInvitation = rowToInvitationWithRSVPsSync(data);
    const enriched = await enrichInvitationsWithTemplates([baseInvitation]);
    return enriched[0];
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
        hide_title: invitation.hide_title ?? false,
        hide_description: invitation.hide_description ?? false,
        organizer_notes: invitation.organizer_notes,
        text_font_family: invitation.text_font_family || 'inter',
        text_overlay_style: invitation.text_overlay_style || 'light',
        text_position: invitation.text_position || 'center',
        text_size: invitation.text_size || 'large',
        text_shadow: invitation.text_shadow ?? true,
        text_background: invitation.text_background ?? false,
        text_background_opacity: invitation.text_background_opacity ?? 0.3,
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
        hide_title: updates.hide_title,
        hide_description: updates.hide_description,
        organizer_notes: updates.organizer_notes,
        text_font_family: updates.text_font_family,
        text_overlay_style: updates.text_overlay_style,
        text_position: updates.text_position,
        text_size: updates.text_size,
        text_shadow: updates.text_shadow,
        text_background: updates.text_background,
        text_background_opacity: updates.text_background_opacity,
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
        email: rsvp.email,
        notification_preferences: rsvp.notification_preferences,
        reminder_status: rsvp.reminder_status,
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
