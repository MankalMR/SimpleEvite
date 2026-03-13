'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DemoBanner } from '@/components/DemoBanner';
import { InvitationPreview } from '@/components/invitation-preview';
import { DefaultTemplate } from '@/lib/supabase';
import { Spinner } from '@/components/spinner';
import { getTextOverlayStyleOptions, getTextPositionOptions, getTextSizeOptions, TextOverlayStyle, TextPosition, TextSize } from '@/lib/text-overlay-utils';

export default function DemoCreateInvitation() {
    const router = useRouter();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [templates, setTemplates] = useState<DefaultTemplate[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        design_id: '',
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

    const selectedDesign = templates.find(t => t.id === formData.design_id) || null;

    // Initialize session
    useEffect(() => {
        const stored = localStorage.getItem('demoSessionId');
        if (stored) {
            setSessionId(stored);
        } else {
            fetch('/api/demo/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
                .then(res => res.json())
                .then(data => {
                    localStorage.setItem('demoSessionId', data.sessionId);
                    setSessionId(data.sessionId);
                });
        }
    }, []);

    // Fetch templates
    useEffect(() => {
        if (!sessionId) return;
        fetch('/api/demo/templates', {
            headers: { 'x-demo-session-id': sessionId },
        })
            .then(res => res.json())
            .then(data => setTemplates(data.templates || []))
            .catch(() => console.error('Failed to load templates'));
    }, [sessionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId) return;

        if (!formData.title || !formData.event_date) {
            setError('Title and event date are required');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/demo/invitations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-demo-session-id': sessionId,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('Failed to create invitation');
            }

            router.push('/demo/dashboard');
        } catch {
            setError('Failed to create invitation. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        window.location.href = '/demo/dashboard';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    return (
        <>
            <DemoBanner onReset={handleReset} />
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Panel - Preview */}
                        <div className="lg:sticky lg:top-8 lg:self-start">
                            <div className="bg-white rounded-lg shadow-sm border p-6 h-[600px] lg:h-[700px]">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
                                <div className="h-[calc(100%-3rem)]">
                                    <InvitationPreview
                                        formData={formData as unknown as Parameters<typeof InvitationPreview>[0]['formData']}
                                        selectedDesign={selectedDesign}
                                        isEditing={false}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Form (Demo Mode) */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Create Demo Invitation</h1>
                                <button
                                    type="button"
                                    onClick={() => router.push('/demo/dashboard')}
                                    className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                                >
                                    ← Back to Dashboard
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                                    {error}
                                </div>
                            )}

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
                                                placeholder="e.g., Summer Pool Party"
                                            />
                                            <label className="flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    name="hide_title"
                                                    checked={formData.hide_title}
                                                    onChange={handleChange}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Hide Title on Invitation</span>
                                            </label>
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
                                                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Tell your guests what to expect..."
                                            />
                                            <label className="flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    name="hide_description"
                                                    checked={formData.hide_description}
                                                    onChange={handleChange}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Hide Description on Invitation</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="e.g., 123 Main Street, Austin, TX"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="organizer_notes" className="block text-sm font-semibold text-gray-900 mb-2">
                                                Organizer&apos;s Notes
                                            </label>
                                            <textarea
                                                id="organizer_notes"
                                                name="organizer_notes"
                                                rows={3}
                                                value={formData.organizer_notes}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Additional details to show below location"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Template Selection */}
                                {templates.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-sm border p-8">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Choose a Design Template</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, design_id: '' })}
                                                className={`p-3 border-2 rounded-lg text-center transition-colors ${!formData.design_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="w-full h-20 bg-gray-100 rounded mb-2 flex items-center justify-center">
                                                    <span className="text-gray-400 text-sm">No template</span>
                                                </div>
                                                <p className="text-xs font-medium text-gray-700">Plain Text</p>
                                            </button>
                                            {templates.map((template) => (
                                                <button
                                                    key={template.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, design_id: template.id })}
                                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${formData.design_id === template.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="w-full h-20 bg-gray-100 rounded mb-2 overflow-hidden">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={template.thumbnail_url || template.image_url}
                                                            alt={template.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-700 truncate">{template.name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Text Overlay Styling */}
                                <div className="bg-white rounded-lg shadow-sm border p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Text Overlay Styling</h2>

                                    <div className="mb-6">
                                        <label htmlFor="text_font_family" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Font Family
                                        </label>
                                        <select
                                            id="text_font_family"
                                            name="text_font_family"
                                            value={formData.text_font_family}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="inter">Inter (Clean & Modern)</option>
                                            <option value="playfair">Playfair Display (Elegant Serif)</option>
                                            <option value="lora">Lora (Classic Serif)</option>
                                            <option value="pacifico">Pacifico (Playful Script)</option>
                                            <option value="oswald">Oswald (Strong Sans)</option>
                                        </select>
                                    </div>

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
                                                onChange={(e) => setFormData({ ...formData, text_background_opacity: parseFloat((e.target as HTMLInputElement).value) })}
                                                className="w-full"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/demo/dashboard')}
                                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                    >
                                        {submitting && <Spinner className="-ml-1 mr-2 h-5 w-5 text-white" />}
                                        {submitting ? 'Creating...' : 'Create Invitation'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
