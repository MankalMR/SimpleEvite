import { MetadataRoute } from 'next';
import { supabaseDb } from '@/lib/database-supabase';
import { logger } from "@/lib/logger";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://evite.mankala.space'
      : 'http://localhost:3008');
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    // Fetch all active template categories (occasions) for dynamic SEO entry points
    const templates = await supabaseDb.getTemplates();
    
    // Get unique occasions to create category pages in the sitemap
    const occasions = Array.from(new Set(templates.map(t => t.occasion)));
    
    const templateRoutes: MetadataRoute.Sitemap = occasions.map(occasion => ({
      url: `${baseUrl}/templates/${occasion}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...templateRoutes];
  } catch (error) {
    logger.error({ error }, 'Error generating dynamic sitemap:');
    return staticRoutes;
  }
}
