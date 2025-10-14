import { useCallback } from 'react';
import { useApiRequest } from './useApiRequest';
import { Design } from '@/lib/supabase';

/**
 * Custom hook for managing designs data
 */
export function useDesigns() {
  // Fetch all user designs
  const fetchDesigns = useCallback(async (): Promise<Design[]> => {
    const response = await fetch('/api/designs');
    if (!response.ok) {
      throw new Error('Failed to fetch designs');
    }
    const data = await response.json();
    return data.designs || [];
  }, []);

  // Delete design
  const deleteDesign = useCallback(async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this design?')) {
      throw new Error('Deletion cancelled');
    }

    const response = await fetch(`/api/designs/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete design');
    }
  }, []);

  // Upload new design
  const uploadDesign = useCallback(async (file: File, name: string): Promise<Design> => {
    // Upload the file - this also creates the design record in the database
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name.trim());

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    const uploadData = await uploadResponse.json();
    return uploadData.design;
  }, []);

  const designsRequest = useApiRequest(fetchDesigns, []);
  const deleteRequest = useApiRequest(deleteDesign);
  const uploadRequest = useApiRequest(uploadDesign);

  return {
    // Data and state
    designs: designsRequest.data || [],

    // Loading states
    loading: designsRequest.loading,
    deleteLoading: deleteRequest.loading,
    uploadLoading: uploadRequest.loading,

    // Error states
    error: designsRequest.error,
    deleteError: deleteRequest.error,
    uploadError: uploadRequest.error,

    // Actions
    fetchDesigns: designsRequest.execute,
    deleteDesign: async (id: string) => {
      await deleteRequest.execute(id);
      // Refresh designs list after successful delete
      if (designsRequest.data) {
        designsRequest.execute();
      }
    },
    uploadDesign: async (file: File, name: string) => {
      const result = await uploadRequest.execute(file, name);
      // Refresh designs list after successful upload
      if (designsRequest.data) {
        designsRequest.execute();
      }
      return result;
    },

    // Reset functions
    reset: () => {
      designsRequest.reset();
      deleteRequest.reset();
      uploadRequest.reset();
    },
  };
}
