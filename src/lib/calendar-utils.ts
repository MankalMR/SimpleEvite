import type { Invitation } from '@/lib/supabase';

/**
 * Helper to format date and time for calendar links.
 * Returns { start, end, isAllDay }
 */
export function getCalendarDates(eventDate: string, eventTime?: string | null) {
  const [year, month, day] = eventDate.split('-');

  if (eventTime) {
    const [hourStr, minuteStr] = eventTime.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Create start and end date objects assuming local timezone
    // We use Date object just to easily add 1 hour for the end time
    const startObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, minute);
    const endObj = new Date(startObj.getTime() + 60 * 60 * 1000); // +1 hour

    const formatDt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${y}${m}${dd}T${hh}${mm}${ss}`;
    };

    return {
      start: formatDt(startObj),
      end: formatDt(endObj),
      isAllDay: false
    };
  } else {
    // All day event
    const startObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const endObj = new Date(startObj.getTime() + 24 * 60 * 60 * 1000); // +1 day

    const formatDt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${dd}`;
    };

    return {
      start: formatDt(startObj),
      end: formatDt(endObj),
      isAllDay: true
    };
  }
}

function buildDescription(invitation: Pick<Invitation, 'description' | 'organizer_notes'>) {
  let desc = '';
  if (invitation.description) {
    desc += invitation.description;
  }
  if (invitation.organizer_notes) {
    if (desc) desc += '\n\n';
    desc += `Organizer Notes:\n${invitation.organizer_notes}`;
  }
  return desc;
}

export function generateGoogleCalendarUrl(invitation: Pick<Invitation, 'title' | 'event_date' | 'event_time' | 'location' | 'description' | 'organizer_notes'>): string {
  const dates = getCalendarDates(invitation.event_date, invitation.event_time);

  const params = new URLSearchParams();
  params.append('action', 'TEMPLATE');
  params.append('text', invitation.title);
  params.append('dates', `${dates.start}/${dates.end}`);

  const description = buildDescription(invitation);
  if (description) {
    params.append('details', description);
  }

  if (invitation.location) {
    params.append('location', invitation.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateYahooCalendarUrl(invitation: Pick<Invitation, 'title' | 'event_date' | 'event_time' | 'location' | 'description' | 'organizer_notes'>): string {
  const dates = getCalendarDates(invitation.event_date, invitation.event_time);

  const params = new URLSearchParams();
  params.append('v', '60');
  params.append('view', 'd');
  params.append('type', '20');
  params.append('title', invitation.title);
  params.append('st', dates.start);
  if (dates.isAllDay) {
    params.append('dur', 'allday');
  } else {
    params.append('et', dates.end);
  }

  const description = buildDescription(invitation);
  if (description) {
    params.append('desc', description);
  }

  if (invitation.location) {
    params.append('in_loc', invitation.location);
  }

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

export function generateIcsContent(invitation: Pick<Invitation, 'title' | 'event_date' | 'event_time' | 'location' | 'description' | 'organizer_notes'>): string {
  const dates = getCalendarDates(invitation.event_date, invitation.event_time);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Simple Evite//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).substring(2)}@simpleevite.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
  ];

  if (dates.isAllDay) {
    lines.push(`DTSTART;VALUE=DATE:${dates.start}`);
    lines.push(`DTEND;VALUE=DATE:${dates.end}`);
  } else {
    lines.push(`DTSTART:${dates.start}`);
    lines.push(`DTEND:${dates.end}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(invitation.title)}`);

  const description = buildDescription(invitation);
  if (description) {
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  }

  if (invitation.location) {
    lines.push(`LOCATION:${escapeIcsText(invitation.location)}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}
