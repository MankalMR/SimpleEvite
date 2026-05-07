import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseDb } from '@/lib/database-supabase';
import { generateEventMetadata } from '@/lib/seo';
import PublicInviteClient from './PublicInviteClient';

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const invitation = await supabaseDb.getInvitationByToken(token);
  
  if (!invitation) {
    return {
      title: 'Invitation Not Found | Simple Evite',
    };
  }

  return generateEventMetadata(invitation as any);
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  const invitation = await supabaseDb.getInvitationByToken(token);

  if (!invitation) {
    notFound();
  }

  return <PublicInviteClient initialInvitation={invitation as any} token={token} />;
}
