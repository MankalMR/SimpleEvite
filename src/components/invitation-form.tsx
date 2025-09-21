'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { getTextOverlayStyleOptions, getTextPositionOptions, getTextSizeOptions, TextOverlayStyle, TextPosition, TextSize } from '@/lib/text-overlay-utils';
import { validateInvitationForm, formatInvitationForSubmission } from '@/lib/form-utils';
import { InvitationPreview } from '@/components/invitation-preview';
import { useDesigns } from '@/hooks/useDesigns';
import { TemplateSelector } from '@/components/template-selector';
import { DefaultTemplate, Invitation } from '@/lib/supabase';


interface InvitationFormProps {
  mode: 'create' | 'edit';
  initialData?: Invitation;
  onSubmit: (formData: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function InvitationForm({ mode, initialData, onSubmit, onCancel, loading = false }: InvitationFormProps) {
  const router = useRouter();

  const [selectedDesign, setSelectedDesign] = useState<{ id: string; name: string; image_url: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DefaultTemplate | null>(null);
  const [designTab, setDesignTab] = useState<'template' | 'custom'>('template');
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
    fetchDesigns,
  } = useDesigns();

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  // Initialize form data from initial data (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        event_date: initialData.event_date ? (initialData.event_date.includes('T') ? initialData.event_date.split('T')[0] : initialData.event_date) : '',
        event_time: initialData.event_time || '',
        location: initialData.location || '',
        design_id: initialData.design_id || '',
        // Text overlay styling options
        text_overlay_style: (initialData.text_overlay_style || 'light') as TextOverlayStyle,
        text_position: (initialData.text_position || 'center') as TextPosition,
        text_size: (initialData.text_size || 'large') as TextSize,
        text_shadow: initialData.text_shadow ?? true,
        text_background: initialData.text_background ?? false,
        text_background_opacity: initialData.text_background_opacity ?? 0.3,
      });

      // Set selected design/template if invitation has one
      if (initialData.design_id) {
        const design = designs.find(d => d.id === initialData.design_id);
        if (design) {
          setSelectedDesign(design);
          setDesignTab('custom');
        } else {
          // If not found in designs, it's likely a template
          // We'll let the template selector component handle finding it
          setDesignTab('template');
        }
      }
    }
  }, [initialData, designs]);

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
      await onSubmit(formattedData);
    } catch (error) {
      console.error(`${mode} invitation error:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${mode} invitation`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDesignSelect = (designId: string) => {
    setFormData({
      ...formData,
      design_id: designId,
    });
    const design = designs.find(d => d.id === designId);
    setSelectedDesign(design || null);
    setSelectedTemplate(null); // Clear template when custom design is selected
  };

  const handleTemplateSelect = (template: DefaultTemplate) => {
    setSelectedTemplate(template);
    setSelectedDesign({
      id: template.id,
      name: template.name,
      image_url: template.image_url
    });
    setFormData({
      ...formData,
      design_id: template.id // Store template ID directly
    });
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
                    isEditing={mode === 'edit'}
                  />
                </div>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  {mode === 'create' ? 'Create New Invitation' : 'Edit Invitation'}
                </h1>
                <button
                  onClick={onCancel}
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
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter event title"
                      />
                      {formErrors.title && <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
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
                          name="event_date"
                          required
                          value={formData.event_date}
                          onChange={handleChange}
                          className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {formErrors.event_date && <p className="text-red-600 text-sm mt-1">{formErrors.event_date}</p>}
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
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter event location"
                      />
                    </div>
                  </div>
                </div>

                {/* Design Selection */}
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Design</h2>

                  {/* Design Tabs */}
                  <div className="mb-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          type="button"
                          onClick={() => setDesignTab('template')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            designTab === 'template'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Choose Template
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignTab('custom')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            designTab === 'custom'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Upload Custom
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Template Selection */}
                  {designTab === 'template' && (
                    <TemplateSelector
                      onSelectTemplate={handleTemplateSelect}
                      selectedTemplateId={selectedTemplate?.id}
                    />
                  )}

                  {/* Custom Design Selection */}
                  {designTab === 'custom' && (
                    <>
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
                    </>
                  )}
                </div>

                {/* Text Overlay Styling */}
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Text Overlay Styling</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="text_overlay_style" className="block text-sm font-semibold text-gray-900 mb-2">
                        Text Style
                      </label>
                      <select
                        id="text_overlay_style"
                        name="text_overlay_style"
                        value={formData.text_overlay_style}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {getTextOverlayStyleOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

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
                            {option.label}
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
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Text Effects
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.text_shadow}
                            onChange={(e) => setFormData({ ...formData, text_shadow: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-900">Add Text Shadow</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.text_background}
                            onChange={(e) => setFormData({ ...formData, text_background: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-900">Add Background</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.text_background && (
                    <div className="mt-6">
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
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? `${mode === 'create' ? 'Creating' : 'Updating'}...` : `${mode === 'create' ? 'Create' : 'Update'} Invitation`}
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
