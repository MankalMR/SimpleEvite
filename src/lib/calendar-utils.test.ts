import { getCalendarDates, generateGoogleCalendarUrl, generateYahooCalendarUrl, generateIcsContent } from './calendar-utils';

describe('calendar-utils', () => {
  describe('getCalendarDates', () => {
    it('handles all day events correctly', () => {
      const dates = getCalendarDates('2025-05-15');
      expect(dates.isAllDay).toBe(true);
      expect(dates.start).toBe('20250515');
      expect(dates.end).toBe('20250516');
    });

    it('handles events with time correctly', () => {
      const dates = getCalendarDates('2025-05-15', '14:30');
      expect(dates.isAllDay).toBe(false);
      expect(dates.start).toBe('20250515T143000');
      expect(dates.end).toBe('20250515T153000'); // Assuming +1 hour
    });
  });

  describe('generateGoogleCalendarUrl', () => {
    it('generates a URL with correct parameters for an all-day event', () => {
      const url = generateGoogleCalendarUrl({
        title: 'My Party',
        event_date: '2025-06-20',
        location: '123 Party St',
        description: 'Come party!',
        organizer_notes: 'BYOB',
      });
      const parsed = new URL(url);
      expect(parsed.origin).toBe('https://calendar.google.com');
      expect(parsed.pathname).toBe('/calendar/render');
      expect(parsed.searchParams.get('action')).toBe('TEMPLATE');
      expect(parsed.searchParams.get('text')).toBe('My Party');
      expect(parsed.searchParams.get('dates')).toBe('20250620/20250621');
      expect(parsed.searchParams.get('details')).toBe('Come party!\n\nOrganizer Notes:\nBYOB');
      expect(parsed.searchParams.get('location')).toBe('123 Party St');
    });

    it('generates a URL with correct parameters for a timed event', () => {
      const url = generateGoogleCalendarUrl({
        title: 'Meeting',
        event_date: '2025-06-20',
        event_time: '18:00',
        location: 'Zoom',
      });
      const parsed = new URL(url);
      expect(parsed.searchParams.get('text')).toBe('Meeting');
      expect(parsed.searchParams.get('dates')).toBe('20250620T180000/20250620T190000');
      expect(parsed.searchParams.get('location')).toBe('Zoom');
    });
  });

  describe('generateYahooCalendarUrl', () => {
    it('generates a URL with correct parameters for an all-day event', () => {
      const url = generateYahooCalendarUrl({
        title: 'My Party',
        event_date: '2025-06-20',
      });
      const parsed = new URL(url);
      expect(parsed.origin).toBe('https://calendar.yahoo.com');
      expect(parsed.pathname).toBe('/');
      expect(parsed.searchParams.get('v')).toBe('60');
      expect(parsed.searchParams.get('title')).toBe('My Party');
      expect(parsed.searchParams.get('st')).toBe('20250620');
      expect(parsed.searchParams.get('dur')).toBe('allday');
    });

    it('generates a URL with correct parameters for a timed event', () => {
      const url = generateYahooCalendarUrl({
        title: 'Meeting',
        event_date: '2025-06-20',
        event_time: '18:00',
      });
      const parsed = new URL(url);
      expect(parsed.searchParams.get('title')).toBe('Meeting');
      expect(parsed.searchParams.get('st')).toBe('20250620T180000');
      expect(parsed.searchParams.get('et')).toBe('20250620T190000');
      expect(parsed.searchParams.get('dur')).toBeNull();
    });
  });

  describe('generateIcsContent', () => {
    it('generates valid ICS content for an all-day event', () => {
      const ics = generateIcsContent({
        title: 'My Party',
        event_date: '2025-06-20',
        location: '123 Party St',
        description: 'Come party!',
      });

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('DTSTART;VALUE=DATE:20250620');
      expect(ics).toContain('DTEND;VALUE=DATE:20250621');
      expect(ics).toContain('SUMMARY:My Party');
      expect(ics).toContain('DESCRIPTION:Come party!');
      expect(ics).toContain('LOCATION:123 Party St');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('generates valid ICS content for a timed event', () => {
      const ics = generateIcsContent({
        title: 'Meeting',
        event_date: '2025-06-20',
        event_time: '18:00',
      });

      expect(ics).toContain('DTSTART:20250620T180000');
      expect(ics).toContain('DTEND:20250620T190000');
    });

    it('escapes characters correctly in ICS content', () => {
      const ics = generateIcsContent({
        title: 'Party, Drinks & Fun',
        event_date: '2025-06-20',
        description: 'Line 1\nLine 2; with semicolon',
      });

      expect(ics).toContain('SUMMARY:Party\\, Drinks & Fun');
      expect(ics).toContain('DESCRIPTION:Line 1\\nLine 2\\; with semicolon');
    });
  });
});
