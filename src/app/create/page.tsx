'use client';

import { useRouter } from 'next/navigation';
import { InvitationForm } from '@/components/invitation-form';
import { useInvitations } from '@/hooks/useInvitations';
import { Invitation } from '@/lib/supabase';

export default function CreateInvitation() {
  const router = useRouter();

  const {
    createInvitation,
    createLoading: loading,
  } = useInvitations();

  const handleSubmit = async (formattedData: Record<string, unknown>) => {
    const invitation = await createInvitation(formattedData as Omit<Invitation, 'id' | 'created_at' | 'updated_at' | 'share_token'>);
    router.push(`/invitations/${invitation.id}`);
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <InvitationForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
    />
  );
}