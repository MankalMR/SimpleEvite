/**
 * @jest-environment node
 */

import {
  getRSVPStats,
  getTotalRSVPCount,
  getFormattedRSVPCounts,
  hasRSVPs,
  getRSVPResponseColor,
  sortRSVPsByDate,
  getGlobalRSVPStats,
  filterRSVPsByResponse,
  getMostRecentRSVP,
  hasPendingResponses,
  getRSVPResponseColorClasses
} from './rsvp-utils';
import { RSVP } from './supabase';

describe('rsvp-utils', () => {
  const mockRSVPs: RSVP[] = [
    {
      id: '1',
      invitation_id: 'inv1',
      name: 'Alice',
      response: 'yes',
      created_at: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      invitation_id: 'inv1',
      name: 'Bob',
      response: 'no',
      created_at: '2024-01-02T10:00:00Z',
    },
    {
      id: '3',
      invitation_id: 'inv1',
      name: 'Charlie',
      response: 'maybe',
      created_at: '2024-01-03T10:00:00Z',
    },
    {
      id: '4',
      invitation_id: 'inv1',
      name: 'David',
      response: 'yes',
      created_at: '2024-01-04T10:00:00Z',
    },
  ];

  describe('getRSVPStats', () => {
    it('should calculate statistics correctly', () => {
      const stats = getRSVPStats(mockRSVPs);
      expect(stats).toEqual({
        yes: 2,
        no: 1,
        maybe: 1,
        total: 4,
      });
    });

    it('should return zeros for an empty array', () => {
      const stats = getRSVPStats([]);
      expect(stats).toEqual({
        yes: 0,
        no: 0,
        maybe: 0,
        total: 0,
      });
    });
  });

  describe('getTotalRSVPCount', () => {
    it('should calculate total count across invitations', () => {
      const invitations = [
        { rsvps: mockRSVPs.slice(0, 2) },
        { rsvps: mockRSVPs.slice(2, 4) },
      ];
      expect(getTotalRSVPCount(invitations)).toBe(4);
    });

    it('should handle invitations without rsvps', () => {
      const invitations = [
        { rsvps: mockRSVPs.slice(0, 2) },
        {},
        { rsvps: [] },
      ];
      expect(getTotalRSVPCount(invitations)).toBe(2);
    });
  });

  describe('getFormattedRSVPCounts', () => {
    it('should return formatted strings', () => {
      const formatted = getFormattedRSVPCounts(mockRSVPs);
      expect(formatted).toEqual({
        yesCount: '2 Yes',
        maybeCount: '1 Maybe',
        noCount: '1 No',
      });
    });
  });

  describe('hasRSVPs', () => {
    it('should return true if there are RSVPs', () => {
      expect(hasRSVPs({ rsvps: mockRSVPs })).toBe(true);
    });

    it('should return false if there are no RSVPs', () => {
      expect(hasRSVPs({ rsvps: [] })).toBe(false);
      expect(hasRSVPs({})).toBe(false);
    });
  });

  describe('getRSVPResponseColor', () => {
    it('should return correct color classes', () => {
      expect(getRSVPResponseColor('yes')).toBe('text-green-600');
      expect(getRSVPResponseColor('no')).toBe('text-red-600');
      expect(getRSVPResponseColor('maybe')).toBe('text-yellow-600');
      // @ts-expect-error - testing default case
      expect(getRSVPResponseColor('unknown')).toBe('text-gray-600');
    });
  });

  describe('sortRSVPsByDate', () => {
    it('should sort RSVPs newest first', () => {
      const sorted = sortRSVPsByDate(mockRSVPs);
      expect(sorted[0].name).toBe('David');
      expect(sorted[3].name).toBe('Alice');
      expect(new Date(sorted[0].created_at).getTime()).toBeGreaterThan(new Date(sorted[1].created_at).getTime());
    });
  });

  describe('getGlobalRSVPStats', () => {
    it('should aggregate stats across invitations', () => {
      const invitations = [
        { rsvps: [mockRSVPs[0]] }, // Alice (yes)
        { rsvps: [mockRSVPs[1], mockRSVPs[2]] }, // Bob (no), Charlie (maybe)
      ];
      const stats = getGlobalRSVPStats(invitations);
      expect(stats).toEqual({
        yes: 1,
        no: 1,
        maybe: 1,
        total: 3,
      });
    });
  });

  describe('filterRSVPsByResponse', () => {
    it('should filter correctly', () => {
      expect(filterRSVPsByResponse(mockRSVPs, 'yes').length).toBe(2);
      expect(filterRSVPsByResponse(mockRSVPs, 'no').length).toBe(1);
      expect(filterRSVPsByResponse(mockRSVPs, 'maybe').length).toBe(1);
    });
  });

  describe('getMostRecentRSVP', () => {
    it('should return the newest RSVP', () => {
      const recent = getMostRecentRSVP(mockRSVPs);
      expect(recent?.name).toBe('David');
    });

    it('should return null for empty array', () => {
      expect(getMostRecentRSVP([])).toBeNull();
    });
  });

  describe('hasPendingResponses', () => {
    it('should return true if no RSVPs', () => {
      expect(hasPendingResponses({ rsvps: [] })).toBe(true);
      expect(hasPendingResponses({})).toBe(true);
    });

    it('should return false if there are RSVPs', () => {
      expect(hasPendingResponses({ rsvps: mockRSVPs })).toBe(false);
    });
  });

  describe('getRSVPResponseColorClasses', () => {
    it('should return correct class objects', () => {
      expect(getRSVPResponseColorClasses('yes')).toEqual({
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      });
      expect(getRSVPResponseColorClasses('no')).toEqual({
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
      });
      expect(getRSVPResponseColorClasses('maybe')).toEqual({
        text: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
      });
      // @ts-expect-error - testing default case
      expect(getRSVPResponseColorClasses('unknown')).toEqual({
        text: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
      });
    });
  });
});
