import { useState, useCallback } from 'react';

export interface ApiRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiRequestReturn<T, TArgs extends readonly unknown[] = readonly unknown[]> extends ApiRequestState<T> {
  execute: (...args: TArgs) => Promise<T>;
  reset: () => void;
}

/**
 * Generic hook for API requests with loading, error, and data state management
 */
export function useApiRequest<T, TArgs extends readonly unknown[] = readonly unknown[]>(
  apiFunction: (...args: TArgs) => Promise<T>,
  initialData: T | null = null,
  options?: ApiRequestOptions<T>
): UseApiRequestReturn<T, TArgs> {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: TArgs): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(...args);
      setState(prev => ({ ...prev, data: result, loading: false, error: null }));

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));

      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }, [apiFunction, options]);

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
