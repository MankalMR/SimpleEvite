import { Invitation } from './supabase';

export type TextOverlayStyle = 'light' | 'dark' | 'vibrant' | 'muted' | 'elegant' | 'bold';
export type TextPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type TextSize = 'small' | 'medium' | 'large' | 'extra-large';

export interface TextOverlayConfig {
  style: TextOverlayStyle;
  position: TextPosition;
  size: TextSize;
  shadow: boolean;
  background: boolean;
  backgroundOpacity: number;
}

// Default text overlay configuration
export const DEFAULT_TEXT_OVERLAY: TextOverlayConfig = {
  style: 'light',
  position: 'center',
  size: 'large',
  shadow: true,
  background: false,
  backgroundOpacity: 0.3,
};

// Style definitions for different text overlay themes
export const TEXT_OVERLAY_STYLES: Record<TextOverlayStyle, {
  textColor: string;
  shadowColor: string;
  backgroundColor?: string;
  fontWeight: string;
  letterSpacing: string;
}> = {
  light: {
    textColor: 'text-white',
    shadowColor: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
    fontWeight: 'font-normal',
    letterSpacing: 'tracking-wide',
  },
  dark: {
    textColor: 'text-gray-900',
    shadowColor: 'drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]',
    fontWeight: 'font-semibold',
    letterSpacing: 'tracking-wide',
  },
  vibrant: {
    textColor: 'text-yellow-400',
    shadowColor: 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]',
    backgroundColor: 'bg-gradient-to-r from-pink-500 to-purple-600',
    fontWeight: 'font-bold',
    letterSpacing: 'tracking-wider',
  },
  muted: {
    textColor: 'text-gray-600',
    shadowColor: 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]',
    fontWeight: 'font-light',
    letterSpacing: 'tracking-normal',
  },
  elegant: {
    textColor: 'text-amber-100',
    shadowColor: 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]',
    fontWeight: 'font-medium',
    letterSpacing: 'tracking-widest',
  },
  bold: {
    textColor: 'text-red-600',
    shadowColor: 'drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]',
    fontWeight: 'font-black',
    letterSpacing: 'tracking-tight',
  },
};

// Position classes for text overlay
export const TEXT_POSITIONS: Record<TextPosition, string> = {
  center: 'items-center justify-center',
  top: 'items-start justify-center pt-12',
  bottom: 'items-end justify-center pb-20',
  left: 'items-center justify-start pl-12 text-left',
  right: 'items-center justify-end pr-12 text-right',
};

// Size classes for text overlay
export const TEXT_SIZES: Record<TextSize, {
  title: string;
  description: string;
}> = {
  small: {
    title: 'text-2xl md:text-3xl',
    description: 'text-sm md:text-base',
  },
  medium: {
    title: 'text-3xl md:text-4xl',
    description: 'text-base md:text-lg',
  },
  large: {
    title: 'text-4xl md:text-6xl',
    description: 'text-lg md:text-xl',
  },
  'extra-large': {
    title: 'text-5xl md:text-7xl',
    description: 'text-xl md:text-2xl',
  },
};

/**
 * Get text overlay configuration from invitation data
 */
export function getTextOverlayConfig(invitation: Invitation): TextOverlayConfig {
  return {
    style: invitation.text_overlay_style || DEFAULT_TEXT_OVERLAY.style,
    position: invitation.text_position || DEFAULT_TEXT_OVERLAY.position,
    size: invitation.text_size || DEFAULT_TEXT_OVERLAY.size,
    shadow: invitation.text_shadow ?? DEFAULT_TEXT_OVERLAY.shadow,
    background: invitation.text_background ?? DEFAULT_TEXT_OVERLAY.background,
    backgroundOpacity: invitation.text_background_opacity ?? DEFAULT_TEXT_OVERLAY.backgroundOpacity,
  };
}

/**
 * Generate CSS classes for text overlay container
 */
export function getTextOverlayContainerClasses(config: TextOverlayConfig): string {
  const positionClasses = TEXT_POSITIONS[config.position];
  return `flex ${positionClasses}`;
}

/**
 * Generate CSS classes for text overlay content
 */
export function getTextOverlayContentClasses(config: TextOverlayConfig): string {
  const style = TEXT_OVERLAY_STYLES[config.style];

  // Determine text alignment based on position
  const textAlign = config.position === 'left' ? 'text-left' :
                   config.position === 'right' ? 'text-right' : 'text-center';

  let classes = `${textAlign} px-4 ${style.textColor} ${style.fontWeight} ${style.letterSpacing}`;

  if (config.shadow) {
    classes += ` ${style.shadowColor}`;
  }

  return classes;
}

/**
 * Generate CSS classes for text overlay title
 */
export function getTextOverlayTitleClasses(config: TextOverlayConfig): string {
  const size = TEXT_SIZES[config.size];
  return `${size.title} font-bold mb-4`;
}

/**
 * Generate CSS classes for text overlay description
 */
export function getTextOverlayDescriptionClasses(config: TextOverlayConfig): string {
  const size = TEXT_SIZES[config.size];
  return `${size.description} max-w-2xl mx-auto`;
}

/**
 * Generate CSS classes for text overlay background
 */
export function getTextOverlayBackgroundClasses(config: TextOverlayConfig): string {
  if (!config.background) return '';

  const style = TEXT_OVERLAY_STYLES[config.style];

  if (style.backgroundColor) {
    return style.backgroundColor;
  }

  return 'bg-black';
}

/**
 * Generate inline styles for text overlay background
 */
export function getTextOverlayBackgroundStyles(config: TextOverlayConfig): React.CSSProperties {
  if (!config.background) return {};

  return {
    backgroundColor: `rgba(0, 0, 0, ${config.backgroundOpacity})`,
  };
}

/**
 * Get all available text overlay style options
 */
export function getTextOverlayStyleOptions(): Array<{
  value: TextOverlayStyle;
  label: string;
  description: string;
}> {
  return [
    { value: 'light', label: 'Light', description: 'Clean white text with dark shadow' },
    { value: 'dark', label: 'Dark', description: 'Dark text with light shadow' },
    { value: 'vibrant', label: 'Vibrant', description: 'Bright yellow text with gradient background' },
    { value: 'muted', label: 'Muted', description: 'Subtle gray text with soft shadow' },
    { value: 'elegant', label: 'Elegant', description: 'Warm amber text with refined styling' },
    { value: 'bold', label: 'Bold', description: 'Strong red text with heavy shadow' },
  ];
}

/**
 * Get all available text position options
 */
export function getTextPositionOptions(): Array<{
  value: TextPosition;
  label: string;
  description: string;
}> {
  return [
    { value: 'center', label: 'Center', description: 'Centered text overlay' },
    { value: 'top', label: 'Top', description: 'Text positioned at the top' },
    { value: 'bottom', label: 'Bottom', description: 'Text positioned at the bottom' },
    { value: 'left', label: 'Left', description: 'Text positioned to the left' },
    { value: 'right', label: 'Right', description: 'Text positioned to the right' },
  ];
}

/**
 * Get all available text size options
 */
export function getTextSizeOptions(): Array<{
  value: TextSize;
  label: string;
  description: string;
}> {
  return [
    { value: 'small', label: 'Small', description: 'Compact text size' },
    { value: 'medium', label: 'Medium', description: 'Standard text size' },
    { value: 'large', label: 'Large', description: 'Prominent text size' },
    { value: 'extra-large', label: 'Extra Large', description: 'Maximum impact text size' },
  ];
}
