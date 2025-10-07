import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://evite.mankala.space' 
      : 'http://localhost:3008');
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/designs`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
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
      url: `${baseUrl}/auth/error`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.1,
    },
  ];
}

// Optional: Generate dynamic sitemap for public invitations
// This would be called periodically or triggered by new invitation creation
export async function generateInvitationSitemap() {
  // This is a placeholder for future implementation
  // You would fetch public invitations and generate sitemap entries

  try {

    // Fetch public invitations that should be indexed
    // const response = await fetch(`${baseUrl}/api/public-invitations`);
    // const invitations = await response.json();

    // return invitations.map(invitation =>
    //   generateSitemapEntry(
    //     `/invite/${invitation.share_token}`,
    //     new Date(invitation.updated_at),
    //     'weekly',
    //     0.7
    //   )
    // );

    return [];
  } catch (error) {
    console.error('Error generating invitation sitemap:', error);
    return [];
  }
}
