'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { getTextOverlayStyleOptions, getTextPositionOptions, getTextSizeOptions, TextOverlayStyle, TextPosition, TextSize } from '@/lib/text-overlay-utils';
import { validateInvitationForm, formatInvitationForSubmission } from '@/lib/form-utils';
import { InvitationPreview } from '@/components/invitation-preview';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';

export default function EditInvitation() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [selectedDesign, setSelectedDesign] = useState<{ id: string; name: string; image_url: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    design_id: '',
    // Text overlay styling options
    text_overlay_style: 'light' as TextOverlayStyle,
    text_position: 'center' as TextPosition,
    text_size: 'large' as TextSize,
    text_shadow: true,
    text_background: false,
    text_background_opacity: 0.3,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    designs,
    loading: designsLoading,
    error: designsError,
    fetchDesigns,
  } = useDesigns();

  const {
    invitation,
    invitationLoading: loading,
    invitationError: error,
    fetchInvitation,
    updateInvitation,
    updateLoading: saving,
    updateError,
  } = useInvitations();

  useEffect(() => {
    fetchDesigns();
    if (id) {
      fetchInvitation(id);
    }
  }, [id, fetchDesigns, fetchInvitation]);

  useEffect(() => {
    if (invitation) {
      // Debug logging
      console.log('Loaded invitation data:', invitation);
      console.log('Text overlay settings:', {
        text_overlay_style: invitation.text_overlay_style,
        text_position: invitation.text_position,
        text_size: invitation.text_size,
        text_shadow: invitation.text_shadow,
        text_background: invitation.text_background,
        text_background_opacity: invitation.text_background_opacity,
      });

      setFormData({
        title: invitation.title || '',
        description: invitation.description || '',
        event_date: invitation.event_date ? (invitation.event_date.includes('T') ? invitation.event_date.split('T')[0] : invitation.event_date) : '',
        event_time: invitation.event_time || '',
        location: invitation.location || '',
        design_id: invitation.design_id || '',
        // Text overlay styling options
        text_overlay_style: (invitation.text_overlay_style || 'light') as TextOverlayStyle,
        text_position: (invitation.text_position || 'center') as TextPosition,
        text_size: (invitation.text_size || 'large') as TextSize,
        text_shadow: invitation.text_shadow ?? true,
        text_background: invitation.text_background ?? false,
        text_background_opacity: invitation.text_background_opacity ?? 0.3,
      });

      // Set selected design if invitation has one
      if (invitation.design_id) {
        const design = designs.find(d => d.id === invitation.design_id);
        setSelectedDesign(design || null);
      }
    }
  }, [invitation, designs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateInvitationForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (!invitation) return;

    try {
      setFormErrors({});
      const formattedData = formatInvitationForSubmission(formData);
      await updateInvitation(invitation.id, formattedData);

      router.push(`/invitations/${invitation.id}`);
    } catch (error) {
      console.error('Update invitation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to update invitation');
    }
  };

  const handleDesignSelect = (designId: string) => {
    setFormData({ ...formData, design_id: designId });
    const design = designs.find(d => d.id === designId);
    setSelectedDesign(design || null);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !invitation) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Invitation not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The invitation may have been deleted or you don&apos;t have permission to edit it.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Preview */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white rounded-lg shadow-sm border p-6 h-[600px] lg:h-[700px]">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
                <div className="h-[calc(100%-3rem)]">
                  <InvitationPreview
                    formData={formData}
                    selectedDesign={selectedDesign}
                    isEditing={true}
                  />
                </div>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Invitation</h1>
            <button
              onClick={() => router.push(`/invitations/${id}`)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Event Information</h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your event"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="event_date" className="block text-sm font-semibold text-gray-900 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      id="event_date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="event_time" className="block text-sm font-semibold text-gray-900 mb-2">
                      Event Time
                    </label>
                    <input
                      type="time"
                      id="event_time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Where will the event take place?"
                  />
                </div>
              </div>
            </div>

            {/* Design Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Design</h2>

              <div className="mb-4">
                <p className="text-sm text-gray-700 font-medium">Choose a Design (Optional)</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* No Design Option */}
                <div
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                    formData.design_id === ''
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleDesignSelect('')}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Design</span>
                  </div>
                  <p className="text-sm text-center text-gray-800 font-medium">
                    Plain Invitation
                  </p>
                </div>

                {/* Available Designs */}
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                      formData.design_id === design.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleDesignSelect(design.id)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                      <Image
                        src={design.image_url}
                        alt={design.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p className="text-sm text-center text-gray-800 font-medium truncate">
                      {design.name}
                    </p>
                  </div>
                ))}
              </div>

              {designs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No custom designs available.</p>
                  <button
                    type="button"
                    onClick={() => router.push('/designs')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Upload your first design →
                  </button>
                </div>
              )}
            </div>

            {/* Text Overlay Styling Section */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Text Overlay Styling</h2>
              <p className="text-sm text-gray-600 mb-6">
                Customize how your text appears on the invitation background image.
              </p>

              <div className="space-y-6">
                {/* Style Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Text Style
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getTextOverlayStyleOptions().map((option) => (
                      <div
                        key={option.value}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                          formData.text_overlay_style === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setFormData({ ...formData, text_overlay_style: option.value })}
                      >
                        <div className="font-semibold text-sm text-gray-900 mb-1">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Position and Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="text_position" className="block text-sm font-semibold text-gray-900 mb-2">
                      Text Position
                    </label>
                    <select
                      id="text_position"
                      value={formData.text_position}
                      onChange={(e) => setFormData({ ...formData, text_position: e.target.value as TextPosition })}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getTextPositionOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="text_size" className="block text-sm font-semibold text-gray-900 mb-2">
                      Text Size
                    </label>
                    <select
                      id="text_size"
                      value={formData.text_size}
                      onChange={(e) => setFormData({ ...formData, text_size: e.target.value as TextSize })}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getTextSizeOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="text_shadow"
                      checked={formData.text_shadow}
                      onChange={(e) => setFormData({ ...formData, text_shadow: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="text_shadow" className="ml-2 block text-sm text-gray-900">
                      Add text shadow for better readability
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="text_background"
                      checked={formData.text_background}
                      onChange={(e) => setFormData({ ...formData, text_background: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="text_background" className="ml-2 block text-sm text-gray-900">
                      Add semi-transparent background behind text
                    </label>
                  </div>

                  {formData.text_background && (
                    <div>
                      <label htmlFor="text_background_opacity" className="block text-sm font-semibold text-gray-900 mb-2">
                        Background Opacity: {Math.round(formData.text_background_opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        id="text_background_opacity"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.text_background_opacity}
                        onChange={(e) => setFormData({ ...formData, text_background_opacity: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push(`/invitations/${id}`)}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
