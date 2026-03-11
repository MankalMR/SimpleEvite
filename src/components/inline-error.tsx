'use client';

interface InlineErrorProps {
  error: string | null;
  onDismiss?: () => void;
  className?: string;
}

export function InlineError({ error, onDismiss, className = "mb-6" }: InlineErrorProps) {
  if (!error) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm ${onDismiss ? 'flex justify-between items-center' : ''} ${className}`}
      role="alert"
    >
      <span>{error}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-700 hover:text-red-900 focus:outline-none ml-4"
          aria-label="Close error message"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
