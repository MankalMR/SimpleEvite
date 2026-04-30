/**
 * @jest-environment jsdom
 */

import {
  sanitizeHTML,
  sanitizeText,
  validateEmail,
  validateInvitationData,
  validateRSVPData,
  generateSecureToken,
  containsDangerousContent,
  escapeHTML,
  serializeJsonLd,
  checkRateLimit,
  cleanupRateLimitStore
} from './security';

describe('security', () => {
  describe('sanitizeHTML', () => {
    it('should preserve allowed tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <em>Em</em> <strong>Strong</strong> <p>Paragraph</p> <br>';
      const result = sanitizeHTML(input);
      expect(result).toBe(input);
    });

    it('should remove disallowed tags', () => {
      const input = '<div>Div</div> <script>alert("xss")</script> <iframe></iframe>';
      const result = sanitizeHTML(input);
      expect(result).toBe('Div  ');
    });

    it('should remove all attributes', () => {
      const input = '<b class="bold" onclick="alert(1)">Text</b> <p style="color: red">Para</p>';
      const result = sanitizeHTML(input);
      expect(result).toBe('<b>Text</b> <p>Para</p>');
    });

    it('should handle nested tags correctly', () => {
      const input = '<p><b>Bold <i>Italic</i></b></p>';
      const result = sanitizeHTML(input);
      expect(result).toBe('<p><b>Bold <i>Italic</i></b></p>');
    });

    it('should handle malformed HTML', () => {
      const input = '<b>Bold <i>Italic';
      const result = sanitizeHTML(input);
      expect(result).toBe('<b>Bold <i>Italic</i></b>');
    });

    it('should return empty string for empty input', () => {
      expect(sanitizeHTML('')).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('should trim whitespace', () => {
      expect(sanitizeText('  text  ')).toBe('text');
    });

    it('should remove < and > characters', () => {
      expect(sanitizeText('text <script>alert(1)</script>')).toBe('text scriptalert(1)/script');
    });

    it('should limit length to 1000 characters', () => {
      const longText = 'a'.repeat(1100);
      const result = sanitizeText(longText);
      expect(result.length).toBe(1000);
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test@domain.')).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a token of specified length', () => {
      expect(generateSecureToken(16).length).toBe(16);
      expect(generateSecureToken(32).length).toBe(32);
      expect(generateSecureToken().length).toBe(32); // Default length
    });

    it('should use allowed characters', () => {
      const token = generateSecureToken(100);
      expect(token).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate different tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('containsDangerousContent', () => {
    it('should return true for dangerous patterns', () => {
      expect(containsDangerousContent('<script>')).toBe(true);
      expect(containsDangerousContent('javascript:alert(1)')).toBe(true);
      expect(containsDangerousContent('onclick=')).toBe(true);
      expect(containsDangerousContent('<iframe')).toBe(true);
    });

    it('should return false for safe content', () => {
      expect(containsDangerousContent('Hello world')).toBe(false);
      expect(containsDangerousContent('This is a safe text.')).toBe(false);
      expect(containsDangerousContent('Check out this link: http://example.com')).toBe(false);
    });
  });

  describe('validateInvitationData', () => {
    it('should validate correct invitation data', () => {
      const data = {
        title: 'Wedding Party',
        description: 'Join us for our special day',
        event_date: '2024-12-25',
        location: 'Grand Ballroom',
        hide_title: true,
        organizer_notes: 'Please park in the rear.',
        text_font_family: 'pacifico'
      };
      const result = validateInvitationData(data);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.title).toBe('Wedding Party');
      expect(result.sanitizedData.hide_title).toBe(true);
      expect(result.sanitizedData.organizer_notes).toBe('Please park in the rear.');
      expect(result.sanitizedData.text_font_family).toBe('pacifico');
    });

    it('should return errors for invalid invitation data', () => {
      const data = {
        title: 'A', // Too short
        event_date: 'invalid-date',
        organizer_notes: 'A'.repeat(1001), // Too long
        text_font_family: 'comic-sans' // Invalid font
      };
      const result = validateInvitationData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBeDefined();
      expect(result.errors.event_date).toBeDefined();
      expect(result.errors.organizer_notes).toBeDefined();
      expect(result.errors.text_font_family).toBeDefined();
    });

    it('should sanitize title, description and organizer notes', () => {
      const data = {
        title: 'Party <script>',
        description: 'Cool party <b>!',
        event_date: '2024-12-25',
        organizer_notes: 'Notes <iframe>'
      };
      const result = validateInvitationData(data);
      expect(result.sanitizedData.title).toBe('Party script');
      expect(result.sanitizedData.description).toBe('Cool party b!');
      expect(result.sanitizedData.organizer_notes).toBe('Notes iframe');
    });

    it('should convert empty rsvp_deadline string to undefined', () => {
      const data = {
        title: 'Test Event',
        event_date: '2024-12-25',
        rsvp_deadline: '',
      };
      const result = validateInvitationData(data);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.rsvp_deadline).toBeUndefined();
    });
  });

  describe('validateRSVPData', () => {
    it('should validate correct RSVP data', () => {
      const data = {
        name: 'John Doe',
        response: 'yes',
        comment: 'Can\'t wait!',
        email: 'john@example.com',
      };
      const result = validateRSVPData(data);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.name).toBe('John Doe');
    });

    it('should return errors for invalid RSVP data', () => {
      const data = {
        name: 'J', // Too short
        response: 'invalid',
      };
      const result = validateRSVPData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.response).toBeDefined();
      expect(result.errors.email).toBeDefined();
    });
  });

  describe('escapeHTML', () => {
    it('should escape HTML characters', () => {
      const input = '<script>alert("xss")</script> & "quotes"';
      const result = escapeHTML(input);
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt; &amp; "quotes"');
    });
  });

  describe('serializeJsonLd', () => {
    it('should safely serialize objects and escape dangerous characters', () => {
      const data = {
        title: 'Party</script><script>alert("XSS")</script>',
        description: 'Food & Drinks',
        location: '123 <Street>',
      };
      const result = serializeJsonLd(data);

      expect(result).not.toContain('</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('&');

      expect(result).toContain('\\u003c/script\\u003e');
      expect(result).toContain('\\u003cscript\\u003e');
      expect(result).toContain('Food \\u0026 Drinks');
      expect(result).toContain('123 \\u003cStreet\\u003e');

      // Ensure it's still valid JSON if parsed
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(data);
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      cleanupRateLimitStore();
      // We need to clear the store manually if cleanupRateLimitStore only removes EXPIRED entries.
      // Since it's a private variable in security.ts, we might need a way to reset it.
      // Looking at security.ts, rateLimitStore is not exported.
      // Let's use unique identifiers for each test.
    });

    it('should allow requests within limit', () => {
      const id = 'test-id-1';
      const result = checkRateLimit(id, 2);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should deny requests exceeding limit', () => {
      const id = 'test-id-2';
      checkRateLimit(id, 1);
      const result = checkRateLimit(id, 1);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after windowMs', () => {
      jest.useFakeTimers();
      const id = 'test-id-3';
      checkRateLimit(id, 1, 1000);

      jest.advanceTimersByTime(1001);

      const result = checkRateLimit(id, 1, 1000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);

      jest.useRealTimers();
    });
  });

  describe('cleanupRateLimitStore', () => {
    it('should not throw errors', () => {
      expect(() => cleanupRateLimitStore()).not.toThrow();
    });
  });
});
