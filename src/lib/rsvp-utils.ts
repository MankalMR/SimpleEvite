import { RSVP } from './supabase';

export interface RSVPStats {
  yes: number;
  no: number;
  maybe: number;
  total: number;
  attendingCount: number;
}

/**
 * Calculate RSVP statistics from an array of RSVPs
 * ⚡ Bolt: Using for...of instead of reduce for better performance on large arrays
 */
export function getRSVPStats(rsvps: RSVP[]): RSVPStats {
  const stats = { yes: 0, no: 0, maybe: 0, total: 0, attendingCount: 0 };

  if (!rsvps || !rsvps.length) return stats;

  for (const rsvp of rsvps) {
    if (rsvp.response === 'yes') {
      stats.yes++;
      stats.attendingCount += (rsvp.guest_count !== undefined ? Number(rsvp.guest_count) : 1);
    }
    else if (rsvp.response === 'no') stats.no++;
    else if (rsvp.response === 'maybe') stats.maybe++;
    stats.total++;
  }

  return stats;
}

/**
 * Get the total count of all RSVPs across multiple invitations
 * ⚡ Bolt: Using for...of instead of reduce for better performance
 */
export function getTotalRSVPCount(invitations: Array<{ rsvps?: RSVP[] }>): number {
  let total = 0;

  if (!invitations || !invitations.length) return total;

  for (const invitation of invitations) {
    if (invitation.rsvps?.length) {
      total += invitation.rsvps.length;
    }
  }

  return total;
}

/**
 * Get formatted RSVP counts for display
 */
export function getFormattedRSVPCounts(rsvps: RSVP[]): {
  yesCount: string;
  maybeCount: string;
  noCount: string;
} {
  const stats = getRSVPStats(rsvps);
  return {
    yesCount: `${stats.yes} Yes`,
    maybeCount: `${stats.maybe} Maybe`,
    noCount: `${stats.no} No`,
  };
}

/**
 * Check if an invitation has any RSVPs
 */
export function hasRSVPs(invitation: { rsvps?: RSVP[] }): boolean {
  return (invitation.rsvps?.length || 0) > 0;
}

/**
 * Get RSVP response color for UI
 */
export function getRSVPResponseColor(response: 'yes' | 'no' | 'maybe'): string {
  switch (response) {
    case 'yes':
      return 'text-green-600';
    case 'no':
      return 'text-red-600';
    case 'maybe':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Sort RSVPs by creation date (newest first)
 */
export function sortRSVPsByDate(rsvps: RSVP[]): RSVP[] {
  return [...rsvps].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Get RSVP statistics across multiple invitations
 * ⚡ Bolt: Using nested for...of loops instead of flatMap to avoid intermediate array allocation
 */
export function getGlobalRSVPStats(invitations: Array<{ rsvps?: RSVP[] }>): RSVPStats {
  const stats = { yes: 0, no: 0, maybe: 0, total: 0, attendingCount: 0 };

  if (!invitations || !invitations.length) return stats;

  for (const invitation of invitations) {
    if (!invitation.rsvps || !invitation.rsvps.length) continue;

    for (const rsvp of invitation.rsvps) {
      if (rsvp.response === 'yes') {
        stats.yes++;
        stats.attendingCount += (rsvp.guest_count !== undefined ? Number(rsvp.guest_count) : 1);
      }
      else if (rsvp.response === 'no') stats.no++;
      else if (rsvp.response === 'maybe') stats.maybe++;
      stats.total++;
    }
  }

  return stats;
}

/**
 * Filter RSVPs by response type
 */
export function filterRSVPsByResponse(rsvps: RSVP[], response: 'yes' | 'no' | 'maybe'): RSVP[] {
  return rsvps.filter(rsvp => rsvp.response === response);
}

/**
 * Get the most recent RSVP from a list
 */
export function getMostRecentRSVP(rsvps: RSVP[]): RSVP | null {
  if (rsvps.length === 0) return null;
  return sortRSVPsByDate(rsvps)[0];
}

/**
 * Check if an invitation has any pending responses (no RSVPs yet)
 */
export function hasPendingResponses(invitation: { rsvps?: RSVP[] }): boolean {
  return (invitation.rsvps?.length || 0) === 0;
}

/**
 * Get RSVP response color classes for Tailwind
 */
export function getRSVPResponseColorClasses(response: 'yes' | 'no' | 'maybe'): {
  text: string;
  bg: string;
  border: string;
} {
  switch (response) {
    case 'yes':
      return {
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      };
    case 'no':
      return {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    case 'maybe':
      return {
        text: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
      };
    default:
      return {
        text: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
      };
  }
}

/**
 * Check if a user is the owner of an invitation associated with an RSVP
 * This function handles both object and array formats returned by Supabase joins
 */
export function isInvitationOwner(
  invitationsData: { user_id: string } | { user_id: string }[] | undefined | null,
  userId: string
): boolean {
  if (!invitationsData) return false;
  
  const invitation = Array.isArray(invitationsData) 
    ? invitationsData[0] 
    : (invitationsData as { user_id: string });
    
  return invitation?.user_id === userId;
}
