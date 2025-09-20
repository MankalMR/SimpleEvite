import { RSVP } from './supabase';

export interface RSVPStats {
  yes: number;
  no: number;
  maybe: number;
  total: number;
}

/**
 * Calculate RSVP statistics from an array of RSVPs
 */
export function getRSVPStats(rsvps: RSVP[]): RSVPStats {
  const stats = rsvps.reduce(
    (acc, rsvp) => {
      acc[rsvp.response]++;
      acc.total++;
      return acc;
    },
    { yes: 0, no: 0, maybe: 0, total: 0 }
  );

  return stats;
}

/**
 * Get the total count of all RSVPs across multiple invitations
 */
export function getTotalRSVPCount(invitations: Array<{ rsvps?: RSVP[] }>): number {
  return invitations.reduce((total, invitation) => {
    return total + (invitation.rsvps?.length || 0);
  }, 0);
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
 */
export function getGlobalRSVPStats(invitations: Array<{ rsvps?: RSVP[] }>): RSVPStats {
  const allRSVPs = invitations.flatMap(inv => inv.rsvps || []);
  return getRSVPStats(allRSVPs);
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
