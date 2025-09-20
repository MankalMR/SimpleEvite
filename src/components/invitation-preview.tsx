'use client';

import { formatDisplayDate } from '@/lib/date-utils';
import { InvitationDisplay } from './invitation-display';
import { Invitation } from '@/lib/supabase';

interface InvitationPreviewProps {
  formData: {
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    design_id: string;
    text_overlay_style: 'light' | 'dark' | 'vibrant' | 'muted' | 'elegant' | 'bold';
    text_position: 'center' | 'top' | 'bottom' | 'left' | 'right';
    text_size: 'small' | 'medium' | 'large' | 'extra-large';
    text_shadow: boolean;
    text_background: boolean;
    text_background_opacity: number;
  };
  selectedDesign?: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  isEditing?: boolean;
}

export function InvitationPreview({ formData, selectedDesign }: InvitationPreviewProps) {
  // Check if user has entered any meaningful data
  const hasContent = formData.title.trim() || formData.description.trim();

  // Create a mock invitation object for the display component
  const mockInvitation: Invitation = {
    id: 'preview',
    user_id: 'preview',
    title: formData.title || '',
    description: formData.description || '',
    event_date: formData.event_date || new Date().toISOString().split('T')[0],
    event_time: formData.event_time || '',
    location: formData.location || '',
    design_id: formData.design_id || undefined,
    share_token: 'preview',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    text_overlay_style: formData.text_overlay_style,
    text_position: formData.text_position,
    text_size: formData.text_size,
    text_shadow: formData.text_shadow,
    text_background: formData.text_background,
    text_background_opacity: formData.text_background_opacity,
  };

  // Show empty state when no content has been entered
  if (!hasContent && !selectedDesign) {
    return (
      <div className="w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Your Invitation</h3>
            <p className="text-gray-500 text-sm">
              Start filling in your event details to see a live preview of your invitation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col">
      {/* Main invitation display with fixed aspect ratio matching actual view */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Use same dimensions as actual invitation: h-64 md:h-96 */}
          <InvitationDisplay
            invitation={mockInvitation}
            design={selectedDesign}
            className="h-64 md:h-80 w-full"
            showPlaceholder={true}
          />
        </div>
      </div>

      {/* Event details section - positioned at bottom like actual invitation */}
      {(formData.event_date || formData.event_time || formData.location) && (
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm p-4 border-t border-gray-200 rounded-b-lg">
          <div className="space-y-2">
            {formData.event_date && (
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{formatDisplayDate(formData.event_date)}</span>
              </div>
            )}
            {formData.event_time && (
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{formData.event_time}</span>
              </div>
            )}
            {formData.location && (
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{formData.location}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}