/**
 * Centralized URL and domain management utility
 * Handles environment-aware URLs for both development and production
 */

export interface UrlConfig {
  baseUrl: string;
  domain: string;
  protocol: string;
  port?: string;
}

/**
 * Get the base URL based on environment
 * @returns The base URL for the current environment
 */
export function getBaseUrl(): string {
  // Server-side rendering
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL ||
           (process.env.NODE_ENV === 'production'
             ? 'https://evite.mankala.space'
             : 'http://localhost:3008');
  }

  // Client-side rendering
  return window.location.origin;
}

/**
 * Get the full URL configuration
 * @returns Complete URL configuration object
 */
export function getUrlConfig(): UrlConfig {
  const baseUrl = getBaseUrl();
  const url = new URL(baseUrl);

  return {
    baseUrl,
    domain: url.hostname,
    protocol: url.protocol,
    port: url.port || (url.protocol === 'https:' ? '443' : '80')
  };
}

/**
 * Build a full URL from a path
 * @param path - The path to append to the base URL
 * @returns Complete URL
 */
export function buildUrl(path: string = ''): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Build an image URL
 * @param imagePath - The image path (e.g., '/sEvite.png')
 * @returns Complete image URL
 */
export function buildImageUrl(imagePath: string): string {
  return buildUrl(imagePath);
}

/**
 * Get the canonical URL for a page
 * @param path - The page path
 * @returns Canonical URL
 */
export function getCanonicalUrl(path: string = '/'): string {
  return buildUrl(path);
}

/**
 * Get the site name for metadata
 * @returns Site name
 */
export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME || 'Simple Evite';
}

/**
 * Get the site description
 * @returns Site description
 */
export function getSiteDescription(): string {
  return process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'Create stunning, personalized event invitations with RSVP tracking. Perfect for weddings, birthdays, corporate events, and celebrations. Free to use with beautiful templates.';
}

/**
 * Get the site keywords
 * @returns Array of keywords
 */
export function getSiteKeywords(): string[] {
  const envKeywords = process.env.NEXT_PUBLIC_SITE_KEYWORDS;
  if (envKeywords) {
    return envKeywords.split(',').map(k => k.trim());
  }

  return [
    'event invitations',
    'RSVP tracking',
    'wedding invitations',
    'party invitations',
    'event planning',
    'digital invitations',
    'invitation maker',
    'free invitations',
    'birthday invitations',
    'corporate events',
    'celebration invites',
    'online invitations'
  ];
}

/**
 * Get the author information
 * @returns Author object
 */
export function getAuthorInfo() {
  return {
    name: process.env.NEXT_PUBLIC_AUTHOR_NAME || 'Simple Evite',
    url: process.env.NEXT_PUBLIC_AUTHOR_URL || getBaseUrl(),
    email: process.env.NEXT_PUBLIC_AUTHOR_EMAIL || 'hello@simpleevite.com'
  };
}

/**
 * Get the organization information
 * @returns Organization object
 */
export function getOrganizationInfo() {
  return {
    name: 'Simple Evite',
    url: getBaseUrl(),
    logo: buildImageUrl('/sEvite.png'),
    description: getSiteDescription(),
    foundingDate: '2024',
    founder: getAuthorInfo(),
    sameAs: [getBaseUrl()],
    contactPoint: {
      contactType: 'customer service',
      email: getAuthorInfo().email
    }
  };
}

/**
 * Get the web application information
 * @returns Web application object
 */
export function getWebApplicationInfo() {
  return {
    name: 'Simple Evite',
    url: getBaseUrl(),
    description: getSiteDescription(),
    applicationCategory: 'SocialApplication',
    operatingSystem: 'Web Browser',
    offers: {
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'Beautiful invitation templates',
      'RSVP tracking',
      'Custom design uploads',
      'Text overlay customization',
      'Event management',
      'Guest list management',
      'Social media sharing',
      'Mobile responsive design'
    ],
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0.0',
    author: {
      name: 'Simple Evite',
      url: getBaseUrl()
    }
  };
}

/**
 * Check if we're in production
 * @returns True if in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if we're in development
 * @returns True if in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get environment-specific configuration
 * @returns Environment configuration
 */
export function getEnvironmentConfig() {
  return {
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    baseUrl: getBaseUrl(),
    domain: getUrlConfig().domain,
    protocol: getUrlConfig().protocol
  };
}
