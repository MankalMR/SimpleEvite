import { Metadata } from 'next';
import { getBaseUrl, getSiteName, getSiteDescription, getSiteKeywords, buildImageUrl } from './url-utils';

export interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noIndex?: boolean;
}

const SITE_CONFIG = {
  name: getSiteName(),
  description: getSiteDescription(),
  url: getBaseUrl(),
  image: '/sEvite.png',
  twitter: '@simpleevite',
  locale: 'en_US',
  type: 'website',
} as const;

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title = SITE_CONFIG.name,
    description = SITE_CONFIG.description,
    image = SITE_CONFIG.image,
    url = SITE_CONFIG.url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    keywords = getSiteKeywords(),
    noIndex = false,
  } = config;

  const fullTitle = title === SITE_CONFIG.name ? title : `${title} | ${SITE_CONFIG.name}`;
  const fullUrl = url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`;
  const fullImage = image.startsWith('http') ? image : buildImageUrl(image);

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: author ? [{ name: author }] : undefined,
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',

    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: SITE_CONFIG.locale,
      type: type === 'event' ? 'article' : type,
      publishedTime,
      modifiedTime,
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: SITE_CONFIG.twitter,
      site: SITE_CONFIG.twitter,
    },

    // Additional meta tags
    other: {
      'application-name': SITE_CONFIG.name,
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': SITE_CONFIG.name,
      'format-detection': 'telephone=no',
      'msapplication-TileColor': '#2563eb',
      'msapplication-tap-highlight': 'no',
      'theme-color': '#2563eb',
    },

    // Verification tags (add your verification codes)
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    // Canonical URL
    alternates: {
      canonical: fullUrl,
    },
  };

  return metadata;
}

export function generateEventMetadata(invitation: {
  title: string;
  description: string;
  event_date: string;
  location: string;
  share_token: string;
  designs?: { image_url: string } | null;
  default_templates?: { image_url: string } | null;
}): Metadata {
  const eventDate = new Date(invitation.event_date);
  const imageUrl = invitation.designs?.image_url ||
                   invitation.default_templates?.image_url ||
                   '/sEvite.png';

  return generateMetadata({
    title: invitation.title,
    description: `Join us for ${invitation.title} on ${eventDate.toLocaleDateString()}${invitation.location ? ` at ${invitation.location}` : ''}. ${invitation.description}`,
    image: imageUrl,
    url: `/invite/${invitation.share_token}`,
    type: 'event',
    keywords: [
      'event invitation',
      'RSVP',
      invitation.title.toLowerCase(),
      'celebration',
      'party',
      'event',
    ],
  });
}

export function generateStructuredData(invitation: {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  share_token: string;
}) {
  const eventDateTime = `${invitation.event_date}T${invitation.event_time}`;
  const eventUrl = `${SITE_CONFIG.url}/invite/${invitation.share_token}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: invitation.title,
    description: invitation.description,
    startDate: eventDateTime,
    location: invitation.location ? {
      '@type': 'Place',
      name: invitation.location,
    } : undefined,
    url: eventUrl,
    image: `${SITE_CONFIG.url}/sEvite.png`,
    organizer: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: eventUrl,
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  };
}

// Sitemap generation helper
export function generateSitemapEntry(
  url: string,
  lastModified?: Date,
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly',
  priority: number = 0.5
) {
  return {
    url: `${SITE_CONFIG.url}${url}`,
    lastModified: lastModified || new Date(),
    changeFrequency,
    priority,
  };
}

