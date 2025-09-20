'use client';

import Image from 'next/image';
import { Invitation } from '@/lib/supabase';
import {
  getTextOverlayConfig,
  getTextOverlayContainerClasses,
  getTextOverlayContentClasses,
  getTextOverlayTitleClasses,
  getTextOverlayDescriptionClasses,
  getTextOverlayBackgroundClasses,
  getTextOverlayBackgroundStyles
} from '@/lib/text-overlay-utils';

interface InvitationDisplayProps {
  invitation: Invitation;
  design?: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  className?: string;
  showPlaceholder?: boolean;
}

/**
 * Unified component for displaying invitations with text overlay
 * Used across live preview, public view, and private view
 */
export function InvitationDisplay({
  invitation,
  design,
  className = "h-96",
  showPlaceholder = false
}: InvitationDisplayProps) {
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

  const textConfig = getTextOverlayConfig(invitation);
  const containerClasses = getTextOverlayContainerClasses(textConfig);
  const contentClasses = getTextOverlayContentClasses(textConfig);
  const titleClasses = getTextOverlayTitleClasses(textConfig);
  const descriptionClasses = getTextOverlayDescriptionClasses(textConfig);
  const backgroundClasses = getTextOverlayBackgroundClasses(textConfig);
  const backgroundStyles = getTextOverlayBackgroundStyles(textConfig);

  return (
    <div className={`relative w-full rounded-lg overflow-hidden ${className}`}>
      {design?.image_url ? (
        <>
          {/* Custom Design Background */}
          <Image
            src={design.image_url}
            alt={design.name}
            fill
            className="object-cover"
            style={{ zIndex: 1 }}
            unoptimized
            onError={(e) => {
              console.error('Image failed to load:', design.image_url, e);
            }}
          />

          {/* Text Overlay */}
          <div className={`absolute inset-0 ${containerClasses}`} style={{ zIndex: 20 }}>
            {textConfig.background && (
              <div
                className={`absolute inset-0 ${backgroundClasses}`}
                style={backgroundStyles}
              />
            )}
            <div className={contentClasses}>
              <h1 className={titleClasses}>
                {invitation.title || (showPlaceholder ? (
                  <span style={{ opacity: 0.6, fontStyle: 'italic' }}>
                    Enter your event title...
                  </span>
                ) : '')}
              </h1>
              {(invitation.description || showPlaceholder) && (
                <p className={descriptionClasses}>
                  {invitation.description || (showPlaceholder ? (
                    <span style={{ opacity: 0.6, fontStyle: 'italic' }}>
                      Event description will appear here...
                    </span>
                  ) : '')}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Beautiful Gradient Background with Text Overlay */
        <div className={`h-full relative ${getGradientForStyle(invitation.text_overlay_style || 'vibrant')}`}>
          {/* Text overlay with customizable styling */}
          <div className={`absolute inset-0 ${containerClasses}`}>
            {textConfig.background && (
              <div
                className={`absolute inset-0 ${backgroundClasses}`}
                style={backgroundStyles}
              />
            )}
            <div className={contentClasses}>
              <h1 className={titleClasses}>
                {invitation.title || (showPlaceholder ? (
                  <span style={{ opacity: 0.6, fontStyle: 'italic' }}>
                    Enter your event title...
                  </span>
                ) : '')}
              </h1>
              {(invitation.description || showPlaceholder) && (
                <p className={descriptionClasses}>
                  {invitation.description || (showPlaceholder ? (
                    <span style={{ opacity: 0.6, fontStyle: 'italic' }}>
                      Event description will appear here...
                    </span>
                  ) : '')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
