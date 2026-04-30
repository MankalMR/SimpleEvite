import { formatInvitationForSubmission } from './form-utils';

describe('form-utils', () => {
  describe('formatInvitationForSubmission', () => {
    it('should format valid data correctly', () => {
      const formData = {
        title: ' Test Event ',
        description: ' Description ',
        event_date: '2024-12-25',
        event_time: '18:00',
        location: ' Home ',
        rsvp_deadline: '2024-12-20',
        design_id: 'design-1',
        text_overlay_style: 'light',
        text_position: 'center',
        text_size: 'large',
        text_shadow: true,
        text_background: false,
        text_background_opacity: 0.3,
        hide_title: false,
        hide_description: false,
        organizer_notes: ' Notes ',
        text_font_family: 'inter',
      };

      const result = formatInvitationForSubmission(formData);

      expect(result.title).toBe('Test Event');
      expect(result.description).toBe('Description');
      expect(result.location).toBe('Home');
      expect(result.rsvp_deadline).toBe('2024-12-20');
      expect(result.organizer_notes).toBe('Notes');
    });

    it('should handle empty strings for optional fields', () => {
      const formData = {
        title: 'Test',
        description: '',
        event_date: '2024-12-25',
        event_time: '18:00',
        location: 'Home',
        rsvp_deadline: ' ',
        design_id: '',
        organizer_notes: '',
      };

      const result = formatInvitationForSubmission(formData);

      expect(result.rsvp_deadline).toBeUndefined();
      expect(result.design_id).toBeUndefined();
      expect(result.organizer_notes).toBeUndefined();
    });

    it('should use default values for missing overlay fields', () => {
      const formData = {
        title: 'Test',
        description: 'Test',
        event_date: '2024-12-25',
        event_time: '18:00',
        location: 'Home',
      };

      const result = formatInvitationForSubmission(formData);

      expect(result.text_overlay_style).toBe('light');
      expect(result.text_position).toBe('center');
      expect(result.text_size).toBe('large');
      expect(result.text_shadow).toBe(true);
      expect(result.text_background).toBe(false);
      expect(result.text_background_opacity).toBe(0.3);
    });
  });
});
