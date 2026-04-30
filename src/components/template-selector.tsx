'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { DefaultTemplate } from '@/lib/supabase';

interface TemplateSelectorProps {
  onSelectTemplate: (template: DefaultTemplate) => void;
  selectedTemplateId?: string;
}

// Helper function to format occasion labels
const formatOccasionLabel = (occasion: string): string => {
  const labelMap: Record<string, string> = {
    'birthday': 'Birthday',
    'christmas': 'Christmas',
    'new-year': 'New Year',
    'thanksgiving': 'Thanksgiving',
    'diwali': 'Diwali',
    'satyanarayan': 'Satyanarayan Vratam',
    'housewarming': 'Housewarming',
  };
  return labelMap[occasion] || occasion.charAt(0).toUpperCase() + occasion.slice(1);
};

// Helper function to format theme labels
const formatThemeLabel = (theme: string): string => {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
};

export function TemplateSelector({ onSelectTemplate, selectedTemplateId }: TemplateSelectorProps) {
  const [allTemplates, setAllTemplates] = useState<DefaultTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DefaultTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [availableOccasions, setAvailableOccasions] = useState<{ value: string; label: string }[]>([]);
  const [availableThemes, setAvailableThemes] = useState<{ value: string; label: string }[]>([]);

  const fetchAllTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      const templates = data.templates || [];
      setAllTemplates(templates);

      // Extract unique occasions and themes
      const uniqueOccasions = [...new Set(templates.map((t: DefaultTemplate) => t.occasion))] as string[];
      const uniqueThemes = [...new Set(templates.map((t: DefaultTemplate) => t.theme))] as string[];

      setAvailableOccasions([
        { value: '', label: 'All Occasions' },
        ...uniqueOccasions.map((occasion: string) => ({
          value: occasion,
          label: formatOccasionLabel(occasion)
        }))
      ]);

      setAvailableThemes([
        { value: '', label: 'All Themes' },
        ...uniqueThemes.map((theme: string) => ({
          value: theme,
          label: formatThemeLabel(theme)
        }))
      ]);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on selected occasion and theme
  const filterTemplates = useCallback(() => {
    let filtered = allTemplates;

    if (selectedOccasion) {
      filtered = filtered.filter(template => template.occasion === selectedOccasion);
    }

    if (selectedTheme) {
      filtered = filtered.filter(template => template.theme === selectedTheme);
    }

    setFilteredTemplates(filtered);
  }, [allTemplates, selectedOccasion, selectedTheme]);

  // Fetch all templates on component mount
  useEffect(() => {
    fetchAllTemplates();
  }, []);

  // Filter templates when selection changes
  useEffect(() => {
    filterTemplates();
  }, [filterTemplates]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted/50 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted/30 rounded-[var(--radius)] h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchAllTemplates}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="template-occasion-filter" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Occasion
          </label>
          <select
            id="template-occasion-filter"
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
          >
            {availableOccasions.map((occasion) => (
              <option key={occasion.value} value={occasion.value}>
                {occasion.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="template-theme-filter" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Theme
          </label>
          <select
            id="template-theme-filter"
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full px-4 py-3 text-foreground bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
          >
            {availableThemes.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No templates found for the selected filters.</div>
          <button
            onClick={() => {
              setSelectedOccasion('');
              setSelectedTheme('');
            }}
            className="text-primary hover:text-primary/80 font-bold uppercase tracking-widest text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`relative bg-card rounded-[var(--radius)] border-2 transition-all cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary overflow-hidden flex flex-col ${
                selectedTemplateId === template.id
                  ? 'border-primary shadow-md'
                  : 'border-border/40 hover:border-muted-foreground/30 hover:shadow-md hover:-translate-y-0.5'
              }`}
              onClick={() => onSelectTemplate(template)}
              aria-pressed={selectedTemplateId === template.id}
            >
              {/* Template Preview */}
              <div className="relative h-48 w-full overflow-hidden bg-muted/30 flex-shrink-0">
                {template.thumbnail_url || template.image_url ? (
                  <Image
                    src={template.thumbnail_url || template.image_url}
                    alt={template.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <span className="text-muted-foreground text-sm">Preview</span>
                  </div>
                )}

                {/* Selection Indicator */}
                {selectedTemplateId === template.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-foreground mb-2 truncate">{template.name}</h3>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary whitespace-nowrap">
                    {template.occasion.replace('-', ' ')}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground whitespace-nowrap">
                    {template.theme}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-auto min-h-[2.5rem]">
                  {template.description || '\u00A0'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
