/**
 * Security utilities for input validation and sanitization
 */

import DOMPurify from 'isomorphic-dompurify';

// Rate limiting configuration
export const RATE_LIMITS = {
  API_REQUESTS: 100, // requests per minute
  RSVP_SUBMISSIONS: 5, // submissions per minute
  INVITATIONS_CREATION: 10, // invitations per hour
  LOGIN_ATTEMPTS: 5, // attempts per 15 minutes
} as const;

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)\.]{10,}$/,
  URL: /^https?:\/\/[^\s<>"{}|\\^`\[\]]+$/,
  NAME: /^[a-zA-Z\s\-'\.]{1,100}$/,
  SAFE_TEXT: /^[a-zA-Z0-9\s\-_.,!?()'"]{1,1000}$/,
} as const;

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize text input for safe database storage
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  return VALIDATION_PATTERNS.EMAIL.test(email);
}

/**
 * Validate and sanitize invitation data
 */
export function validateInvitationData(data: Record<string, unknown>) {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title || typeof data.title !== 'string') {
    errors.title = 'Title is required';
  } else if (data.title.length < 3 || data.title.length > 100) {
    errors.title = 'Title must be between 3 and 100 characters';
  }

  // Description validation
  if (data.description && typeof data.description === 'string') {
    if (data.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
  }

  // Event date validation
  if (!data.event_date || typeof data.event_date !== 'string') {
    errors.event_date = 'Event date is required';
  } else {
    const eventDate = new Date(data.event_date);
    if (isNaN(eventDate.getTime())) {
      errors.event_date = 'Invalid event date';
    }
  }

  // RSVP deadline validation
  if (data.rsvp_deadline && typeof data.rsvp_deadline === 'string') {
    const deadlineDate = new Date(data.rsvp_deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.rsvp_deadline = 'Invalid RSVP deadline';
    }
  }

  // Location validation
  if (data.location && typeof data.location === 'string') {
    if (data.location.length > 200) {
      errors.location = 'Location must be less than 200 characters';
    }
  }

  // Organizer notes validation
  if (data.organizer_notes && typeof data.organizer_notes === 'string') {
    if (data.organizer_notes.length > 1000) {
      errors.organizer_notes = 'Organizer notes must be less than 1000 characters';
    }
  }

  // Font family validation
  const validFonts = ['inter', 'playfair', 'lora', 'pacifico', 'oswald'];
  if (data.text_font_family && typeof data.text_font_family === 'string') {
    if (!validFonts.includes(data.text_font_family)) {
      errors.text_font_family = 'Invalid font family selected';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      title: sanitizeText(data.title as string),
      description: sanitizeText((data.description as string) || ''),
      location: sanitizeText((data.location as string) || ''),
      event_date: data.event_date as string,
      event_time: data.event_time as string,
      rsvp_deadline: (data.rsvp_deadline as string)?.trim() || undefined,
      hide_title: !!data.hide_title,
      hide_description: !!data.hide_description,
      organizer_notes: data.organizer_notes ? sanitizeText(data.organizer_notes as string) : undefined,
      text_font_family: validFonts.includes(data.text_font_family as string) ? (data.text_font_family as 'inter' | 'playfair' | 'lora' | 'pacifico' | 'oswald') : 'inter',
      // Pass through overlay settings with defaults
      design_id: (data.design_id as string)?.trim() || undefined,
      text_overlay_style: (data.text_overlay_style as 'light' | 'dark' | 'vibrant' | 'muted' | 'elegant' | 'bold') || 'light',
      text_position: (data.text_position as 'center' | 'top' | 'bottom' | 'left' | 'right') || 'center',
      text_size: (data.text_size as 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large') || 'large',
      text_shadow: data.text_shadow as boolean ?? true,
      text_background: data.text_background as boolean ?? false,
      text_background_opacity: typeof data.text_background_opacity === 'number' ? data.text_background_opacity : 0.3,
    },
  };
}

/**
 * Validate and sanitize RSVP data
 */
export function validateRSVPData(data: unknown): { isValid: boolean; errors: Record<string, string>; sanitizedData?: { name: string; response: unknown; comment: string; guest_count: number; email: string; } } {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { data: 'Invalid data format' },
    };
  }

  const record = data as Record<string, unknown>;
  const errors: Record<string, string> = {};

  // Name validation
  if (!record.name || typeof record.name !== 'string') {
    errors.name = 'Name is required';
  } else if (record.name.length < 2 || record.name.length > 50) {
    errors.name = 'Name must be between 2 and 50 characters';
  } else if (!VALIDATION_PATTERNS.NAME.test(record.name)) {
    errors.name = 'Name contains invalid characters';
  }

  // Email validation
  if (!record.email || typeof record.email !== 'string') {
    errors.email = 'Email is required';
  } else {
    const emailTrimmed = record.email.trim();
    if (!VALIDATION_PATTERNS.EMAIL.test(emailTrimmed)) {
      errors.email = 'Please provide a valid email address';
    }
  }

  // Response validation
  if (!record.response || !['yes', 'no', 'maybe'].includes(record.response as string)) {
    errors.response = 'Please select a valid response';
  }

  // Guest count validation
  let guestCount = 1;
  if (record.response === 'yes' && record.guest_count !== undefined && record.guest_count !== null) {
      const parsed = typeof record.guest_count === 'string' ? parseInt(record.guest_count, 10) : Number(record.guest_count);
      if (isNaN(parsed) || parsed < 1 || parsed > 100) {
          errors.guest_count = 'Guest count must be a number between 1 and 100';
      } else {
          guestCount = parsed;
      }
  }

  // Comment validation
  if (record.comment && typeof record.comment === 'string') {
    if (record.comment.length > 300) {
      errors.comment = 'Comment must be less than 300 characters';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: Object.keys(errors).length === 0 ? {
      name: sanitizeText(record.name as string),
      response: record.response,
      comment: sanitizeText((record.comment as string) || ''),
      guest_count: guestCount,
      email: (record.email as string).trim(),
    } : undefined,
  };
}

/**
 * Generate a secure random token using cryptographically secure PRNG
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(array[i] % chars.length);
  }
  return result;
}

/**
 * Check if a string contains potentially dangerous content
 */
export function containsDangerousContent(input: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
  ];

  return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Escape special characters for safe HTML output
 */
export function escapeHTML(text: string): string {
  if (typeof document === 'undefined') {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Safely serialize an object to JSON for use in <script type="application/ld+json">
 * Escapes <, >, &, and other characters to prevent XSS.
 */
export function serializeJsonLd(data: unknown): string {
  const json = JSON.stringify(data);
  return json.replace(/[<>&]/g, (char) => {
    switch (char) {
      case '<': return '\\u003c';
      case '>': return '\\u003e';
      case '&': return '\\u0026';
      default: return char;
    }
  });
}

/**
 * Rate limiting in-memory store (for development)
 * In production, use Redis or another persistent store
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting function
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60000 // 1 minute default
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // First request or window expired
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment counter
  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
