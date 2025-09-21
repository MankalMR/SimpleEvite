'use client';

import { useRouter } from 'next/navigation';
import { InvitationForm } from '@/components/invitation-form';
import { useInvitations } from '@/hooks/useInvitations';

export default function CreateInvitation() {
  const router = useRouter();

  const {
    createInvitation,
    createLoading: loading,
  } = useInvitations();

  const handleSubmit = async (formattedData: any) => {
    const invitation = await createInvitation(formattedData);
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