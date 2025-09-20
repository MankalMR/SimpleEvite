'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { getTextOverlayStyleOptions, getTextPositionOptions, getTextSizeOptions, TextOverlayStyle, TextPosition, TextSize } from '@/lib/text-overlay-utils';
import { validateInvitationForm, formatInvitationForSubmission } from '@/lib/form-utils';
import { InvitationPreview } from '@/components/invitation-preview';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';

export default function CreateInvitation() {
  const router = useRouter();
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
    createInvitation,
    createLoading: loading,
    createError,
  } = useInvitations();

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateInvitationForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setFormErrors({});
      const formattedData = formatInvitationForSubmission(formData);
      const invitation = await createInvitation(formattedData);
      router.push(`/invitations/${invitation.id}`);
    } catch (error) {
      console.error('Create invitation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create invitation');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDesignSelect = (designId: string) => {
    setFormData({ ...formData, design_id: designId });
    const design = designs.find(d => d.id === designId);
    setSelectedDesign(design || null);
  };

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
                    isEditing={false}
                  />
                </div>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Invitation</h1>
          <p className="text-gray-600">
            Fill in the details for your event invitation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 ${
                    formErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Birthday Party, Wedding, BBQ..."
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  placeholder="Tell your guests what to expect..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event_date" className="block text-sm font-semibold text-gray-900 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    id="event_date"
                    name="event_date"
                    required
                    value={formData.event_date}
                    onChange={handleChange}
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
                    name="event_time"
                    value={formData.event_time}
                    onChange={handleChange}
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
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  placeholder="e.g., 123 Main St, Virtual link, TBD..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Design</h2>

            {designsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading designs...</span>
              </div>
            ) : (
              <div>
                <label htmlFor="design_id" className="block text-sm font-semibold text-gray-900 mb-3">
                  Choose a Design (Optional)
                </label>

                {designs.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border">
                    <p className="text-gray-800 mb-4 font-medium">No designs available yet.</p>
                    <p className="text-sm text-gray-700">
                      Upload designs from the{' '}
                      <a href="/designs" className="text-blue-600 hover:text-blue-800 underline font-medium">
                        My Designs
                      </a>
                      {' '}page to use them here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.design_id === ''
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleDesignSelect('')}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-gray-600 text-sm font-medium">No Design</span>
                      </div>
                      <p className="text-sm text-center text-gray-800 font-medium">Plain Invitation</p>
                    </div>

                    {designs.map((design) => (
                      <div
                        key={design.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
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
                )}
              </div>
            )}
          </div>

          {/* Text Overlay Styling Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Text Overlay Styling</h2>
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
                    name="text_position"
                    value={formData.text_position}
                    onChange={handleChange}
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
                    name="text_size"
                    value={formData.text_size}
                    onChange={handleChange}
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
                    name="text_shadow"
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
                    name="text_background"
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
                      name="text_background_opacity"
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

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Invitation'}
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
