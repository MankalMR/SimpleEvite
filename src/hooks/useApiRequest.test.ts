/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useApiRequest } from './useApiRequest';

describe('useApiRequest', () => {
  const mockData = { id: 1, name: 'Test' };
  const mockApiFunc = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useApiRequest(mockApiFunc));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should initialize with provided initialData', () => {
    const initialData = { initial: true };
    const { result } = renderHook(() => useApiRequest(mockApiFunc, initialData));

    expect(result.current.data).toEqual(initialData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful API call', async () => {
    mockApiFunc.mockResolvedValueOnce(mockData);
    const { result } = renderHook(() => useApiRequest(mockApiFunc));

    let promise: Promise<unknown>;
    await act(async () => {
      promise = result.current.execute('arg1', 123);
    });

    const data = await promise!;

    expect(mockApiFunc).toHaveBeenCalledWith('arg1', 123);
    expect(data).toEqual(mockData);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call onSuccess option on successful API call', async () => {
    const onSuccess = jest.fn();
    mockApiFunc.mockResolvedValueOnce(mockData);
    const { result } = renderHook(() => useApiRequest(mockApiFunc, null, { onSuccess }));

    await act(async () => {
      await result.current.execute();
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should handle API call failure', async () => {
    const errorMessage = 'API Error';
    mockApiFunc.mockRejectedValueOnce(new Error(errorMessage));
    const { result } = renderHook(() => useApiRequest(mockApiFunc));

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // Error is expected to be re-thrown
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should call onError option on API call failure', async () => {
    const onError = jest.fn();
    const error = new Error('API Error');
    mockApiFunc.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useApiRequest(mockApiFunc, null, { onError }));

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // Error is expected
      }
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should handle non-Error objects in catch block', async () => {
    const errorString = 'Something went wrong';
    mockApiFunc.mockRejectedValueOnce(errorString);
    const { result } = renderHook(() => useApiRequest(mockApiFunc));

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // Error is expected
      }
    });

    expect(result.current.error).toBe('An unknown error occurred');
    expect(result.current.loading).toBe(false);
  });

  it('should set loading state correctly during execution', async () => {
    let resolveApi: (value: unknown) => void;
    const apiPromise = new Promise((resolve) => {
      resolveApi = resolve;
    });
    mockApiFunc.mockReturnValueOnce(apiPromise);

    const { result } = renderHook(() => useApiRequest(mockApiFunc));

    let executePromise: Promise<unknown>;
    await act(async () => {
      executePromise = result.current.execute();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolveApi!(mockData);
      await executePromise!;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
  });

  it('should reset state to initial values', async () => {
    mockApiFunc.mockResolvedValueOnce(mockData);
    const { result } = renderHook(() => useApiRequest(mockApiFunc));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData);

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
