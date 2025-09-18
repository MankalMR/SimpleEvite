import type { NextConfig } from "next";

// Extract hostname from Supabase URL
const getSupabaseHostname = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      return new URL(supabaseUrl).hostname;
    } catch (error) {
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
    ],
  },
};

export default nextConfig;
