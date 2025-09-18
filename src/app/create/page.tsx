'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { Design } from '@/lib/supabase';

export default function CreateInvitation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [designsLoading, setDesignsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    design_id: '',
  });

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const response = await fetch('/api/designs');
      if (response.ok) {
        const data = await response.json();
        setDesigns(data.designs);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setDesignsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invitation');
      }

      const data = await response.json();
      router.push(`/invitations/${data.invitation.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  placeholder="e.g., Birthday Party, Wedding, BBQ..."
                />
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
                      onClick={() => setFormData({ ...formData, design_id: '' })}
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
                        onClick={() => setFormData({ ...formData, design_id: design.id })}
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
    </ProtectedRoute>
  );
}
