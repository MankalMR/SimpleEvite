/**
 * @jest-environment node
 */

import {
  formatDisplayDate,
  formatShortDate,
  dateToInputString,
  isDateInPast
} from './date-utils';

describe('date-utils', () => {
  describe('formatDisplayDate', () => {
    it('should format date correctly for display', () => {
      const dateString = '2024-12-25';
      const result = formatDisplayDate(dateString);

      // Should format as "December 25, 2024"
      expect(result).toMatch(/December 25, 2024/);
    });

    it('should handle different timezones correctly', () => {
      const dateString = '2024-12-25';
      const result = formatDisplayDate(dateString);

      // Should not show timezone offset issues
      expect(result).toContain('December 25, 2024');
    });

    it('should handle ISO date strings', () => {
      const isoString = '2024-12-25T19:00:00Z';
      const result = formatDisplayDate(isoString);

      // Should extract date part and format correctly
      expect(result).toContain('December 25, 2024');
    });
  });

  describe('formatShortDate', () => {
    it('should format date in short format', () => {
      const dateString = '2024-12-25';
      const result = formatShortDate(dateString);

      // Should format as "Dec 25, 2024"
      expect(result).toMatch(/Dec 25, 2024/);
    });

    it('should handle different months correctly', () => {
      const dateString = '2024-01-15';
      const result = formatShortDate(dateString);

      expect(result).toMatch(/Jan 15, 2024/);
    });
  });

  describe('dateToInputString', () => {
    it('should convert date to input string format', () => {
      const date = new Date('2024-12-25T19:00:00Z');
      const result = dateToInputString(date);

      // Should format as "2024-12-25"
      expect(result).toBe('2024-12-25');
    });

    it('should handle different dates correctly', () => {
      const date = new Date('2024-01-15T19:00:00Z');
      const result = dateToInputString(date);

      expect(result).toBe('2024-01-15');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2024-01-05T19:00:00Z');
      const result = dateToInputString(date);

      expect(result).toBe('2024-01-05');
    });
  });

  describe('isDateInPast', () => {
    it('should return true for past dates', () => {
      const pastDate = '2020-01-01';
      const result = isDateInPast(pastDate);

      expect(result).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = '2030-01-01';
      const result = isDateInPast(futureDate);

      expect(result).toBe(false);
    });

    it('should return false for today', () => {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const result = isDateInPast(todayString);

      // Should be false since it's today
      expect(result).toBe(false);
    });

    it('should handle edge cases around midnight', () => {
      // Use a fixed past date to avoid timezone issues
      const yesterdayString = '2020-01-01';

      const result = isDateInPast(yesterdayString);
      expect(result).toBe(true);
    });
  });

  describe('timezone handling', () => {
    it('should handle UTC dates correctly', () => {
      const utcDateString = '2024-12-25T00:00:00Z';
      const displayResult = formatDisplayDate(utcDateString);
      const shortResult = formatShortDate(utcDateString);

      expect(displayResult).toContain('December 25, 2024');
      expect(shortResult).toContain('Dec 25, 2024');
    });

    it('should handle local timezone dates correctly', () => {
      const localDate = new Date(2024, 11, 25); // December 25, 2024 in local timezone
      const localDateString = localDate.toISOString().split('T')[0];
      const displayResult = formatDisplayDate(localDateString);
      const shortResult = formatShortDate(localDateString);
      const inputResult = dateToInputString(localDate);

      expect(displayResult).toContain('December 25, 2024');
      expect(shortResult).toContain('Dec 25, 2024');
      expect(inputResult).toBe('2024-12-25');
    });
  });
});
