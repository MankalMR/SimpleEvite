'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { useDesigns } from '@/hooks/useDesigns';

export default function MyDesigns() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    designs,
    loading,
    uploadLoading: uploading,
    fetchDesigns,
    uploadDesign,
    deleteDesign,
  } = useDesigns();

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const designName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      await uploadDesign(file, designName);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload design error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload design');
    }
  };

  // Note: Design editing functionality removed for simplicity
  // Users can delete and re-upload designs if needed

  const handleDeleteDesign = async (id: string) => {
    try {
      await deleteDesign(id);
    } catch (error) {
      console.error('Delete design error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete design');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="aspect-square bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Designs</h1>
            <p className="text-gray-700 font-medium">
              Upload and manage your invitation designs
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Design'}
            </button>
          </div>
        </div>

        {designs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No designs yet</h3>
            <p className="text-gray-800 mb-6 font-medium">
              Upload your first design to start creating beautiful invitations.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Your First Design'}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {designs.map((design) => (
              <div key={design.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  <Image
                    src={design.image_url}
                    alt={design.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {design.name}
                    </h3>
                    <p className="text-xs text-gray-700">
                      Created {new Date(design.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteDesign(design.id)}
                        className="border border-red-300 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Uploading design...</span>
            </div>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
