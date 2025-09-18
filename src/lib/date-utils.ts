// Utility functions for handling dates without timezone issues

/**
 * Converts a Date object to a string suitable for date input fields
 * Ensures no timezone offset issues by using local date components
 */
export function dateToInputString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a date string (YYYY-MM-DD) to a Date object
 * Treats the input as local date to avoid timezone shifts
 */
export function inputStringToDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a date string for display
 * Handles both ISO strings and YYYY-MM-DD format
 */
export function formatDisplayDate(dateString: string): string {
  // If it's an ISO string, extract just the date part
  const dateOnly = dateString.includes('T') ? dateString.split('T')[0] : dateString;
  
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateOnly.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date string for shorter display
 */
export function formatShortDate(dateString: string): string {
  // If it's an ISO string, extract just the date part
  const dateOnly = dateString.includes('T') ? dateString.split('T')[0] : dateString;
  
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateOnly.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Checks if a date (string) is in the past
 */
export function isDateInPast(dateString: string): boolean {
  const dateOnly = dateString.includes('T') ? dateString.split('T')[0] : dateString;
  const [year, month, day] = dateOnly.split('-').map(Number);
  const eventDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  return eventDate < today;
}
