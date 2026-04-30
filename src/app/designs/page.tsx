'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';
import { useDesigns } from '@/hooks/useDesigns';
import { InlineError } from '@/components/inline-error';
import { logger } from "@/lib/logger";
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { Spinner } from '@/components/spinner';

export default function MyDesigns() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
    setActionError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setActionError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setActionError('File size must be less than 5MB');
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
      logger.error({ error }, 'Upload design error:');
      setActionError(error instanceof Error ? error.message : 'Failed to upload design');
    }
  };

  // Note: Design editing functionality removed for simplicity
  // Users can delete and re-upload designs if needed

  const handleDeleteDesign = async (id: string) => {
    setActionError(null);
    try {
      await deleteDesign(id);
    } catch (error) {
      logger.error({ error }, 'Delete design error:');
      setActionError(error instanceof Error ? error.message : 'Failed to delete design');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="py-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-10 bg-muted/50 rounded-xl w-48 mb-8"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-card rounded-[var(--radius)] border-none p-4">
                    <div className="aspect-square bg-muted/50 rounded-xl mb-4"></div>
                    <div className="h-4 bg-muted/50 rounded-lg w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-foreground mb-2">My Templates</h1>
              <p className="text-muted-foreground text-sm font-medium">
                Signature stationery for your premium events.
              </p>
            </div>
            <div className="w-full sm:w-auto">
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
                className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {uploading && <Spinner className="w-4 h-4 text-primary-foreground" />}
                {uploading ? 'Uploading...' : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Design
                  </>
                )}
              </button>
            </div>
          </div>

          <InlineError error={actionError} onDismiss={() => setActionError(null)} />

          {designs.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-[var(--radius)] border border-dashed border-border/40">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold tracking-tighter text-foreground mb-2">No signature designs</h3>
              <p className="text-muted-foreground mb-10 font-medium">
                Upload your first design to begin creating premium invitations.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 mx-auto"
              >
                {uploading && <Spinner className="w-5 h-5 text-primary-foreground" />}
                {uploading ? 'Uploading...' : 'Upload First Design'}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {designs.map((design) => (
                <div key={design.id} className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(45,91,255,0.08)] hover:-translate-y-1">
                  <div className="aspect-square bg-muted relative group-inner">
                    <Image
                      src={design.image_url}
                      alt={design.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                      <Link
                        href={`/create?designId=${design.id}`}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
                      >
                        Select Design
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground truncate">
                        {design.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          {new Date(design.created_at).toLocaleDateString()}
                        </span>
                        <ConfirmDeleteButton
                          onConfirm={() => handleDeleteDesign(design.id)}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
              <div className="bg-card rounded-2xl p-8 flex flex-col items-center space-y-6 shadow-2xl border border-border/40 max-w-sm w-full mx-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-pulse"></div>
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-extrabold tracking-tighter text-foreground mb-2">Processing Design</h3>
                  <p className="text-sm text-muted-foreground font-medium">Preparing your signature invitation asset...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
