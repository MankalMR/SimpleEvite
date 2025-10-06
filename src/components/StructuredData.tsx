'use client';

import { useEffect } from 'react';
import { getBaseUrl, getSiteName, getSiteDescription, getAuthorInfo, buildImageUrl } from '@/lib/url-utils';

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
}

// Predefined structured data schemas
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": getSiteName(),
  "url": getBaseUrl(),
  "logo": buildImageUrl('/sEvite.png'),
  "description": getSiteDescription(),
  "foundingDate": "2024",
  "founder": {
    "@type": "Person",
    "name": getAuthorInfo().name,
    "url": getAuthorInfo().url
  },
  "sameAs": [
    getAuthorInfo().url
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": getAuthorInfo().email
  }
};

export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": getSiteName(),
  "url": getBaseUrl(),
  "description": getSiteDescription(),
  "applicationCategory": "SocialApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Beautiful invitation templates",
    "RSVP tracking",
    "Custom design uploads",
    "Text overlay customization",
    "Event management",
    "Guest list management",
    "Social media sharing",
    "Mobile responsive design"
  ],
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "softwareVersion": "1.0.0",
  "author": {
    "@type": "Organization",
    "name": getSiteName(),
    "url": getBaseUrl()
  }
};

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Event-specific schema for invitations
export const eventSchema = (invitation: {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  share_token: string;
}) => {
  const eventDateTime = `${invitation.event_date}T${invitation.event_time}`;
  const eventUrl = `${getBaseUrl()}/invite/${invitation.share_token}`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": invitation.title,
    "description": invitation.description,
    "startDate": eventDateTime,
    "location": invitation.location ? {
      "@type": "Place",
      "name": invitation.location,
    } : undefined,
    "url": eventUrl,
    "image": buildImageUrl('/sEvite.png'),
    "organizer": {
      "@type": "Organization",
      "name": getSiteName(),
      "url": getBaseUrl(),
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": eventUrl,
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  };
};
