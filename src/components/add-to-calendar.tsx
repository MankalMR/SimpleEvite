'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Download, Globe } from 'lucide-react';
import type { Invitation } from '@/lib/supabase';
import {
  generateGoogleCalendarUrl,
  generateYahooCalendarUrl,
  generateIcsContent
} from '@/lib/calendar-utils';

interface AddToCalendarProps {
  invitation: Pick<Invitation, 'title' | 'event_date' | 'event_time' | 'location' | 'description' | 'organizer_notes'>;
}

export function AddToCalendar({ invitation }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadIcs = () => {
    const icsContent = generateIcsContent(invitation);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${invitation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
        Add to Calendar
        <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <a
              href={generateGoogleCalendarUrl(invitation)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Globe className="w-4 h-4 mr-3 text-gray-400" />
              Google Calendar
            </a>
            <a
              href={generateYahooCalendarUrl(invitation)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Globe className="w-4 h-4 mr-3 text-gray-400" />
              Yahoo Calendar
            </a>
            <button
              onClick={handleDownloadIcs}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <Download className="w-4 h-4 mr-3 text-gray-400" />
              Apple / Outlook (.ics)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
