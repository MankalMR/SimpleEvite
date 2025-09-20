'use client';

import { formatDisplayDate } from '@/lib/date-utils';
import {
  getTextOverlayConfig,
  getTextOverlayContainerClasses,
  getTextOverlayContentClasses,
  getTextOverlayTitleClasses,
  getTextOverlayDescriptionClasses,
  getTextOverlayBackgroundClasses,
  getTextOverlayBackgroundStyles
} from '@/lib/text-overlay-utils';

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

export function InvitationPreview({ formData, selectedDesign, isEditing = false }: InvitationPreviewProps) {
  // Check if user has entered any meaningful data
  const hasContent = formData.title.trim() || formData.description.trim();

  // Create beautiful gradient backgrounds for when no design is selected
  const gradientBackgrounds = [
    'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500',
    'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500',
    'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600',
    'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500',
    'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500',
    'bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600'
  ];

  // Select gradient based on text style for consistency
  const getGradientForStyle = (style: string) => {
    switch (style) {
      case 'vibrant': return gradientBackgrounds[0]; // Purple-pink-red
      case 'elegant': return gradientBackgrounds[1]; // Blue-purple-pink
      case 'bold': return gradientBackgrounds[2]; // Green-blue-purple
      case 'light': return gradientBackgrounds[4]; // Indigo-purple-pink
      case 'dark': return gradientBackgrounds[5]; // Teal-blue-indigo
      case 'muted': return gradientBackgrounds[3]; // Yellow-red-pink
      default: return gradientBackgrounds[0];
    }
  };

  // Create a mock invitation object for the text overlay utilities
  const mockInvitation = {
    id: 'preview',
    user_id: 'preview',
    title: formData.title || 'Your Event Title',
    description: formData.description || 'Event description will appear here...',
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

  const textConfig = getTextOverlayConfig(mockInvitation);
  const containerClasses = getTextOverlayContainerClasses(textConfig);
  const contentClasses = getTextOverlayContentClasses(textConfig);
  const titleClasses = getTextOverlayTitleClasses(textConfig);
  const descriptionClasses = getTextOverlayDescriptionClasses(textConfig);
  const backgroundClasses = getTextOverlayBackgroundClasses(textConfig);
  const backgroundStyles = getTextOverlayBackgroundStyles(textConfig);


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
    <div className="w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="relative h-full overflow-hidden">
        {selectedDesign ? (
          <>
            {/* Background Image */}
            <div
              className="h-full relative bg-gray-200"
              style={{
                minHeight: '400px',
                width: '100%',
                height: '100%'
              }}
            >
              <img
                src={selectedDesign.image_url}
                alt={selectedDesign.name}
                style={{
                  zIndex: 1,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  console.error('Image failed to load:', selectedDesign.image_url, e);
                  // Hide the img if it fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />

              {/* Text Overlay */}
              <div
                className={containerClasses}
                style={{
                  zIndex: 20,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex'
                }}
              >
                {textConfig.background && (
                  <div
                    className={`absolute inset-0 ${backgroundClasses}`}
                    style={{
                      zIndex: 1,
                      ...backgroundStyles
                    }}
                  />
                )}
                <div
                  className={contentClasses}
                  style={{
                    zIndex: 2,
                    position: 'relative',
                    textAlign: 'center',
                    padding: '1rem'
                  }}
                >
                  <h1
                    className={titleClasses}
                    style={{
                      fontSize: textConfig.size === 'extra-large' ? '3rem' :
                               textConfig.size === 'large' ? '2.5rem' :
                               textConfig.size === 'medium' ? '2rem' : '1.5rem',
                      fontWeight: 'bold',
                      marginBottom: '1rem',
                      color: textConfig.style === 'dark' ? '#1f2937' :
                             textConfig.style === 'light' ? '#ffffff' :
                             textConfig.style === 'vibrant' ? '#fbbf24' :
                             textConfig.style === 'muted' ? '#6b7280' :
                             textConfig.style === 'elegant' ? '#fbbf24' : '#dc2626',
                      textShadow: textConfig.shadow ?
                        (textConfig.style === 'dark' ? '0 2px 4px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.8)') :
                        'none'
                    }}
                  >
                    {formData.title || (
                      <span style={{ opacity: 0.6, fontStyle: 'italic' }}>
                        Enter your event title...
                      </span>
                    )}
                  </h1>
                  {formData.description && (
                    <p
                      className={descriptionClasses}
                      style={{
                        fontSize: textConfig.size === 'extra-large' ? '1.25rem' :
                                 textConfig.size === 'large' ? '1.125rem' :
                                 textConfig.size === 'medium' ? '1rem' : '0.875rem',
                        maxWidth: '32rem',
                        margin: '0 auto',
                        color: textConfig.style === 'dark' ? '#1f2937' :
                               textConfig.style === 'light' ? '#ffffff' :
                               textConfig.style === 'vibrant' ? '#fbbf24' :
                               textConfig.style === 'muted' ? '#6b7280' :
                               textConfig.style === 'elegant' ? '#fbbf24' : '#dc2626',
                        textShadow: textConfig.shadow ?
                          (textConfig.style === 'dark' ? '0 2px 4px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.8)') :
                          'none'
                      }}
                    >
                      {formData.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Design - Beautiful Gradient Background with Text Overlay */
          <div className={`h-full relative ${getGradientForStyle(formData.text_overlay_style)}`}>
            {/* Text overlay with customizable styling */}
            <div className={`absolute inset-0 ${containerClasses}`}>
              {textConfig.background && (
                <div
                  className={`absolute inset-0 ${backgroundClasses}`}
                  style={backgroundStyles}
                />
              )}
              <div className={contentClasses}>
                <h1
                  className={titleClasses}
                  style={{
                    fontSize: textConfig.size === 'extra-large' ? '3rem' :
                             textConfig.size === 'large' ? '2.5rem' :
                             textConfig.size === 'medium' ? '2rem' : '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    color: textConfig.style === 'dark' ? '#1f2937' :
                           textConfig.style === 'light' ? '#ffffff' :
                           textConfig.style === 'vibrant' ? '#fbbf24' :
                           textConfig.style === 'muted' ? '#6b7280' :
                           textConfig.style === 'elegant' ? '#fbbf24' : '#dc2626',
                    textShadow: textConfig.shadow ?
                      (textConfig.style === 'dark' ? '0 2px 4px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.8)') :
                      'none'
                  }}
                >
                  {formData.title || (
                    <span style={{ opacity: 0.6, fontStyle: 'italic' }}>
                      Enter your event title...
                    </span>
                  )}
                </h1>
                {formData.description && (
                  <p
                    className={descriptionClasses}
                    style={{
                      fontSize: textConfig.size === 'extra-large' ? '1.25rem' :
                               textConfig.size === 'large' ? '1.125rem' :
                               textConfig.size === 'medium' ? '1rem' : '0.875rem',
                      maxWidth: '32rem',
                      margin: '0 auto',
                      color: textConfig.style === 'dark' ? '#1f2937' :
                             textConfig.style === 'light' ? '#ffffff' :
                             textConfig.style === 'vibrant' ? '#fbbf24' :
                             textConfig.style === 'muted' ? '#6b7280' :
                             textConfig.style === 'elegant' ? '#fbbf24' : '#dc2626',
                      textShadow: textConfig.shadow ?
                        (textConfig.style === 'dark' ? '0 2px 4px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.8)') :
                        'none'
                    }}
                  >
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Event Details Overlay */}
        {(formData.event_date || formData.event_time || formData.location) && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 border-t border-gray-200"
            style={{ zIndex: 30 }}
          >
            <div className="space-y-3">
              {formData.event_date && (
                <div className="flex items-center text-sm text-gray-800">
                  <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-gray-900">
                    {formatDisplayDate(formData.event_date)}
                  </span>
                </div>
              )}

              {formData.event_time && (
                <div className="flex items-center text-sm text-gray-800">
                  <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">{formData.event_time}</span>
                </div>
              )}

              {formData.location && (
                <div className="flex items-center text-sm text-gray-800">
                  <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">{formData.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Badge */}
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
          {isEditing ? 'Live Preview' : 'Preview'}
        </div>
      </div>
    </div>
  );
}
