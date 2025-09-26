import { Metadata } from 'next';
import { generateEventMetadata } from '@/lib/seo';
import { getBaseUrl } from '@/lib/url-utils';

// Server-side function to fetch invitation data for metadata
async function getInvitation(token: string) {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/invite/${token}`, {
      cache: 'no-store', // Always fetch fresh data for SEO
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching invitation for metadata:', error);
    return null;
  }
}

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const invitation = await getInvitation(resolvedParams.token);

  if (!invitation) {
    return {
      title: 'Invitation Not Found | Simple Evite',
      description: 'The invitation you are looking for could not be found.',
      robots: 'noindex,nofollow',
    };
  }

  return generateEventMetadata(invitation);
}

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
