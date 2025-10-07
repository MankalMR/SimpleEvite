import type { NextConfig } from "next";

// Extract hostname from Supabase URL
const getSupabaseHostname = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      return new URL(supabaseUrl).hostname;
    } catch {
      console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL, falling back to wildcard');
    }
  }
  return null;
};

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
        port: '',
        pathname: '**',
      },
      // Dynamic Supabase hostname from environment
      ...(supabaseHostname ? [{
        protocol: 'https' as const,
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/public/**',
      }] : []),
      // Fallback wildcard for any Supabase instance
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Unsplash for default templates
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
    ],
  },

  // Security Headers
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evite.mankala.space';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

    // Extract domains for CSP
    const googleDomains = [
      'accounts.google.com',
      'lh3.googleusercontent.com',
      '*.googleusercontent.com',
    ];

    // Content Security Policy - simplified and robust
    const csp = [
      "default-src 'self'",
      `connect-src 'self' ${supabaseUrl} https://api.github.com https://*.google.com https://*.googleapis.com https://*.supabase.co ${isProd ? '' : 'ws://localhost:* http://localhost:*'}`,
      `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com ${isProd ? '' : "'unsafe-eval'"}`,
      "script-src-elem 'self' 'unsafe-inline' https://accounts.google.com",
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com data:`,
      `img-src 'self' data: blob: https: https://*.supabase.co https://accounts.google.com https://lh3.googleusercontent.com https://*.googleusercontent.com https://images.unsplash.com`,
      `media-src 'self' https://*.supabase.co`,
      "object-src 'none'",
      "base-uri 'self'",
      `form-action 'self' ${siteUrl}`,
      `frame-ancestors 'none'`,
      `frame-src 'self' https://accounts.google.com`,
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          // Strict Transport Security
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          // Remove server information
          {
            key: 'X-Powered-By',
            value: 'Simple Evite',
          },
          // DNS Prefetch Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Special headers for API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      // Caching headers for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Headers for public invitation pages (SEO friendly)
      {
        source: '/invite/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
