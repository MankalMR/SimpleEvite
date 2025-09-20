import { useState, useCallback } from 'react';

export interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiRequestReturn<T> extends ApiRequestState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

/**
 * Generic hook for API requests with loading, error, and data state management
 */
export function useApiRequest<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiRequestReturn<T> {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(...args);
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}
