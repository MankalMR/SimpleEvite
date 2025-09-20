/**
 * Common form utilities and validation functions
 */

import { Invitation } from './supabase';

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate invitation form data
 */
export function validateInvitationForm(formData: {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
}): FormValidationResult {
  const errors: Record<string, string> = {};

  if (!formData.title.trim()) {
    errors.title = 'Event title is required';
  }

  if (!formData.event_date) {
    errors.event_date = 'Event date is required';
  } else {
    const eventDate = new Date(formData.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      errors.event_date = 'Event date cannot be in the past';
    }
  }

  if (!formData.location.trim()) {
    errors.location = 'Event location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate RSVP form data
 */
export function validateRSVPForm(formData: {
  name: string;
  response: string | 'yes' | 'no' | 'maybe';
}): FormValidationResult {
  const errors: Record<string, string> = {};

  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!formData.response || formData.response === '') {
    errors.response = 'Please select a response';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generic form validation helper
 */
export function validateRequired(fields: Record<string, unknown>, requiredFields: string[]): FormValidationResult {
  const errors: Record<string, string> = {};

  requiredFields.forEach(field => {
    const value = fields[field];
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors[field] = `${field.replace('_', ' ')} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format form data for API submission
 */
export function formatInvitationForSubmission(formData: Record<string, unknown>): Omit<Invitation, 'id' | 'created_at' | 'updated_at' | 'share_token'> {
  return {
    user_id: formData.user_id as string,
    title: (formData.title as string).trim(),
    description: (formData.description as string).trim(),
    event_date: formData.event_date as string,
    event_time: formData.event_time as string,
    location: (formData.location as string).trim(),
    design_id: formData.design_id as string | undefined,
    // Ensure text overlay fields have default values
    text_overlay_style: (formData.text_overlay_style as Invitation['text_overlay_style']) || 'light',
    text_position: (formData.text_position as Invitation['text_position']) || 'center',
    text_size: (formData.text_size as Invitation['text_size']) || 'large',
    text_shadow: (formData.text_shadow as boolean) ?? true,
    text_background: (formData.text_background as boolean) ?? false,
    text_background_opacity: (formData.text_background_opacity as number) ?? 0.3,
  };
}
