'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { InvitationForm } from '@/components/invitation-form';
import { useInvitations } from '@/hooks/useInvitations';
import { Invitation } from '@/lib/supabase';

export default function EditInvitation() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    invitation,
    updateInvitation,
    updateLoading: loading,
    fetchInvitation,
  } = useInvitations();

  useEffect(() => {
    if (id) {
      fetchInvitation(id);
    }
  }, [id, fetchInvitation]);

  const handleSubmit = async (formattedData: Record<string, unknown>) => {
    await updateInvitation(id, formattedData as Partial<Invitation>);
    router.push(`/invitations/${id}`);
  };

  const handleCancel = () => {
    router.push(`/invitations/${id}`);
  };

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <InvitationForm
      mode="edit"
      initialData={invitation}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
    />
  );
}