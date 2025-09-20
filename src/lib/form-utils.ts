/**
 * Common form utilities and validation functions
 */

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
export function validateRequired(fields: Record<string, any>, requiredFields: string[]): FormValidationResult {
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
export function formatInvitationForSubmission(formData: any) {
  return {
    ...formData,
    title: formData.title.trim(),
    description: formData.description.trim(),
    location: formData.location.trim(),
    // Ensure text overlay fields have default values
    text_overlay_style: formData.text_overlay_style || 'light',
    text_position: formData.text_position || 'center',
    text_size: formData.text_size || 'large',
    text_shadow: formData.text_shadow ?? true,
    text_background: formData.text_background ?? false,
    text_background_opacity: formData.text_background_opacity ?? 0.3,
  };
}
