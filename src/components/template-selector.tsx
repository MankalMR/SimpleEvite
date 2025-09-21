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
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchAllTemplates}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occasion
          </label>
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
          >
            {availableOccasions.map((occasion) => (
              <option key={occasion.value} value={occasion.value} className="text-gray-900 bg-white">
                {occasion.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
          >
            {availableThemes.map((theme) => (
              <option key={theme.value} value={theme.value} className="text-gray-900 bg-white">
                {theme.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No templates found for the selected filters.</div>
          <button
            onClick={() => {
              setSelectedOccasion('');
              setSelectedTheme('');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`relative bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                selectedTemplateId === template.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              {/* Template Preview */}
              <div className="relative h-48 w-full rounded-t-lg overflow-hidden bg-gray-100">
                {template.thumbnail_url || template.image_url ? (
                  <Image
                    src={template.thumbnail_url || template.image_url}
                    alt={template.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-gray-400 text-sm">Preview</span>
                  </div>
                )}

                {/* Selection Indicator */}
                {selectedTemplateId === template.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {template.occasion.replace('-', ' ')}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {template.theme}
                  </span>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
