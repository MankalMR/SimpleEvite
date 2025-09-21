/**
 * @jest-environment node
 */

import {
  getTextOverlayConfig,
  getTextOverlayContainerClasses,
  getTextOverlayContentClasses,
  getTextOverlayTitleClasses,
  getTextOverlayDescriptionClasses,
  getTextOverlayBackgroundClasses,
  getTextOverlayBackgroundStyles,
  getTextOverlayStyleOptions,
  getTextPositionOptions,
  getTextSizeOptions,
  DEFAULT_TEXT_OVERLAY,
  TEXT_OVERLAY_STYLES,
  TEXT_POSITIONS,
  TEXT_SIZES,
} from './text-overlay-utils';
import { Invitation } from './supabase';

// Mock invitation data
const mockInvitation: Invitation = {
  id: 'test-id',
  user_id: 'user-123',
  title: 'Test Event',
  description: 'Test Description',
  event_date: '2024-12-31',
  event_time: '18:00',
  location: 'Test Location',
  design_id: 'design-123',
  share_token: 'token-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  text_overlay_style: 'vibrant',
  text_position: 'top',
  text_size: 'extra-large',
  text_shadow: false,
  text_background: true,
  text_background_opacity: 0.5,
};

describe('Text Overlay Utils', () => {
  describe('getTextOverlayConfig', () => {
    it('should return invitation text overlay config when all fields are present', () => {
      const config = getTextOverlayConfig(mockInvitation);

      expect(config).toEqual({
        style: 'vibrant',
        position: 'top',
        size: 'extra-large',
        shadow: false,
        background: true,
        backgroundOpacity: 0.5,
      });
    });

    it('should return default values when text overlay fields are missing', () => {
      const invitationWithoutOverlay = {
        ...mockInvitation,
        text_overlay_style: undefined,
        text_position: undefined,
        text_size: undefined,
        text_shadow: undefined,
        text_background: undefined,
        text_background_opacity: undefined,
      };

      const config = getTextOverlayConfig(invitationWithoutOverlay);

      expect(config).toEqual(DEFAULT_TEXT_OVERLAY);
    });

    it('should handle partial text overlay configuration', () => {
      const partialInvitation = {
        ...mockInvitation,
        text_overlay_style: 'dark' as const,
        text_position: undefined,
        text_size: 'small' as const,
        text_shadow: true,
        text_background: undefined,
        text_background_opacity: undefined,
      };

      const config = getTextOverlayConfig(partialInvitation);

      expect(config).toEqual({
        style: 'dark',
        position: 'center', // default
        size: 'small',
        shadow: true,
        background: false, // default
        backgroundOpacity: 0.3, // default
      });
    });
  });

  describe('getTextOverlayContainerClasses', () => {
    it('should return correct classes for center position', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, position: 'center' as const };
      const classes = getTextOverlayContainerClasses(config);
      expect(classes).toBe('flex items-center justify-center');
    });

    it('should return correct classes for top position', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, position: 'top' as const };
      const classes = getTextOverlayContainerClasses(config);
      expect(classes).toBe('flex items-start justify-center pt-12');
    });

    it('should return correct classes for bottom position', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, position: 'bottom' as const };
      const classes = getTextOverlayContainerClasses(config);
      expect(classes).toBe('flex items-end justify-center pb-20');
    });

    it('should return correct classes for left position', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, position: 'left' as const };
      const classes = getTextOverlayContainerClasses(config);
      expect(classes).toBe('flex items-center justify-start pl-12 text-left');
    });

    it('should return correct classes for right position', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, position: 'right' as const };
      const classes = getTextOverlayContainerClasses(config);
      expect(classes).toBe('flex items-center justify-end pr-12 text-right');
    });
  });

  describe('getTextOverlayContentClasses', () => {
    it('should return correct classes for light style with shadow', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, style: 'light' as const, shadow: true };
      const classes = getTextOverlayContentClasses(config);
      expect(classes).toContain('text-center px-4 text-white font-normal tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]');
    });

    it('should return correct classes for dark style without shadow', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, style: 'dark' as const, shadow: false };
      const classes = getTextOverlayContentClasses(config);
      expect(classes).toContain('text-center px-4 text-gray-900 font-semibold tracking-wide');
      expect(classes).not.toContain('drop-shadow');
    });

    it('should return correct classes for vibrant style', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, style: 'vibrant' as const };
      const classes = getTextOverlayContentClasses(config);
      expect(classes).toContain('text-center px-4 text-yellow-400 font-bold tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]');
    });
  });

  describe('getTextOverlayTitleClasses', () => {
    it('should return correct classes for large size', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, size: 'large' as const };
      const classes = getTextOverlayTitleClasses(config);
      expect(classes).toBe('text-4xl md:text-6xl font-bold mb-4');
    });

    it('should return correct classes for small size', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, size: 'small' as const };
      const classes = getTextOverlayTitleClasses(config);
      expect(classes).toBe('text-2xl md:text-3xl font-bold mb-4');
    });

    it('should return correct classes for extra-large size', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, size: 'extra-large' as const };
      const classes = getTextOverlayTitleClasses(config);
      expect(classes).toBe('text-5xl md:text-7xl font-bold mb-4');
    });
  });

  describe('getTextOverlayDescriptionClasses', () => {
    it('should return correct classes for large size', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, size: 'large' as const };
      const classes = getTextOverlayDescriptionClasses(config);
      expect(classes).toBe('text-lg md:text-xl max-w-2xl mx-auto');
    });

    it('should return correct classes for small size', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, size: 'small' as const };
      const classes = getTextOverlayDescriptionClasses(config);
      expect(classes).toBe('text-sm md:text-base max-w-2xl mx-auto');
    });
  });

  describe('getTextOverlayBackgroundClasses', () => {
    it('should return empty string when background is disabled', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, background: false };
      const classes = getTextOverlayBackgroundClasses(config);
      expect(classes).toBe('');
    });

    it('should return correct classes for vibrant style with background', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, style: 'vibrant' as const, background: true, backgroundOpacity: 0.5 };
      const classes = getTextOverlayBackgroundClasses(config);
      expect(classes).toBe('bg-gradient-to-r from-pink-500 to-purple-600');
    });

    it('should return correct classes for light style with background', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, style: 'light' as const, background: true, backgroundOpacity: 0.3 };
      const classes = getTextOverlayBackgroundClasses(config);
      expect(classes).toBe('bg-black');
    });
  });

  describe('getTextOverlayBackgroundStyles', () => {
    it('should return empty object when background is disabled', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, background: false };
      const styles = getTextOverlayBackgroundStyles(config);
      expect(styles).toEqual({});
    });

    it('should return correct inline styles with opacity', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, background: true, backgroundOpacity: 0.5 };
      const styles = getTextOverlayBackgroundStyles(config);
      expect(styles).toEqual({
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      });
    });

    it('should return correct inline styles with different opacity', () => {
      const config = { ...DEFAULT_TEXT_OVERLAY, background: true, backgroundOpacity: 0.3 };
      const styles = getTextOverlayBackgroundStyles(config);
      expect(styles).toEqual({
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      });
    });
  });

  describe('getTextOverlayStyleOptions', () => {
    it('should return all style options with correct structure', () => {
      const options = getTextOverlayStyleOptions();

      expect(options).toHaveLength(6);
      expect(options[0]).toEqual({
        value: 'light',
        label: 'Light',
        description: 'Clean white text with dark shadow'
      });
      expect(options[5]).toEqual({
        value: 'bold',
        label: 'Bold',
        description: 'Strong red text with heavy shadow'
      });
    });
  });

  describe('getTextPositionOptions', () => {
    it('should return all position options with correct structure', () => {
      const options = getTextPositionOptions();

      expect(options).toHaveLength(5);
      expect(options[0]).toEqual({
        value: 'center',
        label: 'Center',
        description: 'Centered text overlay'
      });
    });
  });

  describe('getTextSizeOptions', () => {
    it('should return all size options with correct structure', () => {
      const options = getTextSizeOptions();

      expect(options).toHaveLength(4);
      expect(options[0]).toEqual({
        value: 'small',
        label: 'Small',
        description: 'Compact text size'
      });
      expect(options[3]).toEqual({
        value: 'extra-large',
        label: 'Extra Large',
        description: 'Maximum impact text size'
      });
    });
  });

  describe('Constants', () => {
    it('should have correct default text overlay configuration', () => {
      expect(DEFAULT_TEXT_OVERLAY).toEqual({
        style: 'light',
        position: 'center',
        size: 'large',
        shadow: true,
        background: false,
        backgroundOpacity: 0.3,
      });
    });

    it('should have all text overlay styles defined', () => {
      const expectedStyles = ['light', 'dark', 'vibrant', 'muted', 'elegant', 'bold'];
      expect(Object.keys(TEXT_OVERLAY_STYLES)).toEqual(expectedStyles);
    });

    it('should have all text positions defined', () => {
      const expectedPositions = ['center', 'top', 'bottom', 'left', 'right'];
      expect(Object.keys(TEXT_POSITIONS)).toEqual(expectedPositions);
    });

    it('should have all text sizes defined', () => {
      const expectedSizes = ['small', 'medium', 'large', 'extra-large'];
      expect(Object.keys(TEXT_SIZES)).toEqual(expectedSizes);
    });
  });
});
