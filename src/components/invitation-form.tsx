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
import { Spinner } from '@/components/spinner';
import { InlineError } from '@/components/inline-error';
import { logger } from "@/lib/logger";
import { useGenerateCopy } from '@/hooks/useGenerateCopy';
import { SmartCopySection } from '@/components/smart-copy-section';

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
    rsvp_deadline: '',
    location: '',
    design_id: '',
    // Text overlay styling options
    text_overlay_style: 'light' as TextOverlayStyle,
    text_position: 'center' as TextPosition,
    text_size: 'large' as TextSize,
    text_shadow: true,
    text_background: false,
    text_background_opacity: 0.3,
    hide_title: false,
    hide_description: false,
    organizer_notes: '',
    text_font_family: 'inter',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { hasTitleBlurred, setHasTitleBlurred, isGenerating, generatedText, setGeneratedText, generateError, generateCopy } = useGenerateCopy();

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
        rsvp_deadline: initialData.rsvp_deadline ? (initialData.rsvp_deadline.includes('T') ? initialData.rsvp_deadline.split('T')[0] : initialData.rsvp_deadline) : '',
        location: initialData.location || '',
        design_id: initialData.design_id || '',
        // Text overlay styling options
        text_overlay_style: (initialData.text_overlay_style || 'light') as TextOverlayStyle,
        text_position: (initialData.text_position || 'center') as TextPosition,
        text_size: (initialData.text_size || 'large') as TextSize,
        text_shadow: initialData.text_shadow ?? true,
        text_background: initialData.text_background ?? false,
        text_background_opacity: initialData.text_background_opacity ?? 0.3,
        hide_title: initialData.hide_title ?? false,
        hide_description: initialData.hide_description ?? false,
        organizer_notes: initialData.organizer_notes || '',
        text_font_family: initialData.text_font_family || 'inter',
      });

      // Set selected design/template if invitation has one
      if (initialData.design_id) {
        const design = designs.find(d => d.id === initialData.design_id);
        if (design) {
          setSelectedDesign(design);
          setDesignTab('custom');
        } else {
          // It's a default template — restore it from the invitation's attached template data
          setDesignTab('template');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const templateData = (initialData as any).default_templates as { id: string; name: string; image_url: string } | undefined;
          if (templateData) {
            setSelectedDesign({
              id: templateData.id,
              name: templateData.name,
              image_url: templateData.image_url,
            });
            setSelectedTemplate(templateData as DefaultTemplate);
          }
        }
      }
    }
  }, [initialData, designs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Validate form
    const validation = validateInvitationForm(formData, mode);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setFormErrors({});
      const formattedData = formatInvitationForSubmission(formData);
      await onSubmit(formattedData);
    } catch (error) {
      logger.error({ error }, `${mode} invitation error:`);
      setSubmissionError(error instanceof Error ? error.message : `Failed to ${mode} invitation`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
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
      <div className="py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Preview */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-6 h-[600px] lg:h-[700px]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Live Preview</h2>
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
              <div className="flex items-center justify-between mb-10">
                <h1 className="text-4xl font-extrabold tracking-tighter text-foreground">
                  {mode === 'create' ? 'New Invite' : 'Edit Invite'}
                </h1>
                <button
                  onClick={onCancel}
                  className="text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-widest text-[10px] px-2 py-1"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-8">
                  <h2 className="text-xl font-extrabold tracking-tighter text-foreground mb-6">Event Information</h2>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        autoFocus
                        value={formData.title}
                        onChange={handleChange}
                        onBlur={() => setHasTitleBlurred(true)}
                        className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Enter event title"
                      />
                      {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                      <label className="flex items-center mt-3 p-3 bg-muted/20 rounded-xl border border-border/40 cursor-pointer hover:bg-muted/30 transition-colors">
                        <input
                          type="checkbox"
                          name="hide_title"
                          checked={formData.hide_title}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                        />
                        <span className="ml-3 text-sm font-bold tracking-tight text-foreground">Hide Title on Invitation</span>
                      </label>
                    </div>



                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="event_date" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          Event Date *
                        </label>
                        <input
                          type="date"
                          id="event_date"
                          name="event_date"
                          required
                          value={formData.event_date}
                          onChange={handleChange}
                          className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                        {formErrors.event_date && <p className="text-red-500 text-sm mt-1">{formErrors.event_date}</p>}
                      </div>

                      <div>
                        <label htmlFor="event_time" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          Event Time
                        </label>
                        <input
                          type="time"
                          id="event_time"
                          name="event_time"
                          value={formData.event_time}
                          onChange={handleChange}
                          className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="rsvp_deadline" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          RSVP Deadline
                        </label>
                        <input
                          type="date"
                          id="rsvp_deadline"
                          name="rsvp_deadline"
                          value={formData.rsvp_deadline}
                          onChange={handleChange}
                          className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                        {formErrors.rsvp_deadline && <p className="text-red-500 text-sm mt-1 font-bold uppercase tracking-tight text-[10px]">{formErrors.rsvp_deadline}</p>}
                      </div>

                    </div>

                    <div>
                      <label htmlFor="location" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Enter event location"
                      />
                    </div>

                    <div>
                      <SmartCopySection
                        hasTitleBlurred={hasTitleBlurred}
                        title={formData.title}
                        isGenerating={isGenerating}
                        generatedText={generatedText}
                        generateError={generateError}
                        onGenerate={() => generateCopy({ title: formData.title, location: formData.location, date: formData.event_date, time: formData.event_time })}
                        onDiscard={() => setGeneratedText(null)}
                        onApply={() => {
                          setFormData({ ...formData, description: generatedText || "" });
                          setGeneratedText(null);
                        }}
                      />
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Describe your event"
                      />
                      <label className="flex items-center mt-3 p-3 bg-muted/20 rounded-xl border border-border/40 cursor-pointer hover:bg-muted/30 transition-colors">
                        <input
                          type="checkbox"
                          name="hide_description"
                          checked={formData.hide_description}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                        />
                        <span className="ml-3 text-sm font-bold tracking-tight text-foreground">Hide Description on Invitation</span>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="organizer_notes" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Organizer&apos;s Notes
                      </label>
                      <textarea
                        id="organizer_notes"
                        name="organizer_notes"
                        rows={3}
                        value={formData.organizer_notes}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Additional details (parking, gifts, attire) to show below location"
                      />
                      <p className="mt-2 text-xs text-muted-foreground/60 font-medium italic">Displayed after event details on the public page.</p>
                    </div>
                  </div>
                </div>

                {/* Design Selection */}
                <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-8">
                  <h2 className="text-xl font-extrabold tracking-tighter text-foreground mb-6">Design</h2>

                  {/* Design Tabs */}
                  <div className="mb-6">
                    <div className="border-b border-border/40">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          type="button"
                          onClick={() => setDesignTab('template')}
                          className={`py-2 px-1 border-b-2 font-bold text-xs uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t ${designTab === 'template'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                            }`}
                        >
                          Choose Template
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignTab('custom')}
                          className={`py-2 px-1 border-b-2 font-bold text-xs uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t ${designTab === 'custom'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
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
                      <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Choose a Design (Optional)</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* No Design Option */}
                        <button
                          type="button"
                          className={`cursor-pointer border-2 rounded-[var(--radius)] p-4 transition-all w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${formData.design_id === ''
                            ? 'border-primary bg-primary/5'
                            : 'border-muted bg-muted/20 hover:border-muted-foreground/30'
                            }`}
                          onClick={() => handleDesignSelect('')}
                          aria-pressed={formData.design_id === ''}
                        >
                          <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden mb-3 flex items-center justify-center border border-border/40 group-hover:bg-muted/50 transition-colors">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Plain</span>
                          </div>
                          <p className="text-xs text-center text-foreground font-bold uppercase tracking-widest">
                            Minimalist
                          </p>
                        </button>

                        {/* Available Designs */}
                        {designs.map((design) => (
                          <button
                            key={design.id}
                            type="button"
                            className={`cursor-pointer border-2 rounded-xl p-4 transition-all w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${formData.design_id === design.id
                              ? 'border-primary bg-primary/5'
                              : 'border-muted bg-muted/20 hover:border-muted-foreground/30'
                              }`}
                            onClick={() => handleDesignSelect(design.id)}
                            aria-pressed={formData.design_id === design.id}
                          >
                            <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden mb-3 relative border border-border/40">
                              <Image
                                src={design.image_url}
                                alt={design.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <p className="text-xs text-center text-foreground font-bold uppercase tracking-widest truncate">
                              {design.name}
                            </p>
                          </button>
                        ))}
                      </div>

                      {designs.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground mb-6 font-medium">No signature designs found.</p>
                          <button
                            type="button"
                            onClick={() => router.push('/designs')}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                          >
                            Upload Design
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Text Overlay Styling */}
                <div className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-8">
                  <h2 className="text-xl font-extrabold tracking-tighter text-foreground mb-6">Text Overlay Styling</h2>

                  <div className="mb-6">
                    <label htmlFor="text_font_family" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Typography
                    </label>
                    <select
                      id="text_font_family"
                      name="text_font_family"
                      value={formData.text_font_family}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="inter">Inter (Modern Sans)</option>
                      <option value="playfair">Playfair (Elegant Serif)</option>
                      <option value="lora">Lora (Classic Serif)</option>
                      <option value="pacifico">Pacifico (Playful Script)</option>
                      <option value="oswald">Oswald (Strong Sans)</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="text_overlay_style" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Color Palette
                      </label>
                      <select
                        id="text_overlay_style"
                        name="text_overlay_style"
                        value={formData.text_overlay_style}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
                      >
                        {getTextOverlayStyleOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="text_position" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Positioning
                      </label>
                      <select
                        id="text_position"
                        name="text_position"
                        value={formData.text_position}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
                      >
                        {getTextPositionOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="text_size" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Scale
                      </label>
                      <select
                        id="text_size"
                        name="text_size"
                        value={formData.text_size}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
                      >
                        {getTextSizeOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Visual Effects
                      </label>
                      <div className="space-y-4">
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.text_shadow}
                            onChange={(e) => setFormData({ ...formData, text_shadow: e.target.checked })}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                          />
                          <span className="ml-3 text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Soft Text Shadow</span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.text_background}
                            onChange={(e) => setFormData({ ...formData, text_background: e.target.checked })}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                          />
                          <span className="ml-3 text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Matte Background</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.text_background && (
                    <div className="mt-8 pt-8 border-t border-border/40">
                      <label htmlFor="text_background_opacity" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                        Background Density: {Math.round(formData.text_background_opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        id="text_background_opacity"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.text_background_opacity}
                        onChange={(e) => setFormData({ ...formData, text_background_opacity: parseFloat(e.target.value) })}
                        className="w-full accent-primary bg-muted/30 rounded-lg h-2"
                      />
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex flex-col gap-4">
                  <InlineError error={submissionError} className="mb-2" />
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="px-6 py-3 bg-muted/50 hover:bg-muted text-foreground rounded-xl font-bold uppercase tracking-widest text-xs transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-10 py-4 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-xl shadow-primary/20"
                    >
                      {loading && <Spinner className="-ml-1 mr-2 h-4 w-4 text-primary-foreground" />}
                      {loading ? 'Processing...' : `${mode === 'create' ? 'Finalize Invite' : 'Update Invite'}`}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
