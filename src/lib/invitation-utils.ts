import { Invitation, Design, DefaultTemplate } from '@/lib/supabase';

// Type for the unified design/template object
export interface InvitationDesign {
  id: string;
  name: string;
  image_url: string;
}

// Extended invitation type that includes the related data
export interface InvitationWithDesignData extends Invitation {
  designs?: Design;
  default_templates?: DefaultTemplate;
}

/**
 * Gets the design or template data for an invitation
 * Prioritizes custom designs over templates
 */
export function getInvitationDesign(invitation: InvitationWithDesignData): InvitationDesign | null {
  // First check for custom design
  if (invitation.designs) {
    return {
      id: invitation.designs.id,
      name: invitation.designs.name,
      image_url: invitation.designs.image_url,
    };
  }

  // Then check for default template
  if (invitation.default_templates) {
    return {
      id: invitation.default_templates.id,
      name: invitation.default_templates.name,
      image_url: invitation.default_templates.image_url,
    };
  }

  return null;
}

/**
 * Gets the image URL for an invitation (design or template)
 * Returns null if no image is available
 */
export function getInvitationImageUrl(invitation: InvitationWithDesignData): string | null {
  const design = getInvitationDesign(invitation);
  return design?.image_url || null;
}

/**
 * Checks if an invitation has any design or template
 */
export function hasInvitationDesign(invitation: InvitationWithDesignData): boolean {
  return !!(invitation.designs || invitation.default_templates);
}

/**
 * Gets the design/template name for an invitation
 */
export function getInvitationDesignName(invitation: InvitationWithDesignData): string | null {
  const design = getInvitationDesign(invitation);
  return design?.name || null;
}

/**
 * Checks if the invitation is using a template (vs custom design)
 */
export function isUsingTemplate(invitation: InvitationWithDesignData): boolean {
  return !!invitation.default_templates && !invitation.designs;
}
