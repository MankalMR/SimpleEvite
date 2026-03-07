'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DemoBanner } from '@/components/DemoBanner';
import { DefaultTemplate } from '@/lib/supabase';

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
        text_overlay_style: 'light' as string,
        text_position: 'center' as string,
        text_size: 'large' as string,
    });

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

    return (
        <>
            <DemoBanner onReset={handleReset} />
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Create Invitation</h1>
                        <button
                            onClick={() => router.push('/demo/dashboard')}
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
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
                                placeholder="e.g., Summer Pool Party"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Tell your guests what to expect..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                placeholder="e.g., 123 Main Street, Austin, TX"
                            />
                        </div>

                        {/* Template Selection */}
                        {templates.length > 0 && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Choose a Design Template
                                </label>
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

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.push('/demo/dashboard')}
                                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Creating...' : 'Create Invitation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
