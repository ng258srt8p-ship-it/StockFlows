import { useState, useCallback, useRef } from 'react';

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Data fetching with loading/error/data states.
 * Supports custom headers, GET/POST, and manual refetch.
 */
export function useFetch<T>(url: string, options: FetchOptions = {}): UseFetchResult<T> {
  const { headers: customHeaders, ...fetchOptions } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      // Cancel previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: signal ?? controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...customHeaders,
            ...(fetchOptions.headers as Record<string, string>),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = (await response.json()) as T;
        setData(result);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        setLoading(false);
      }
    },
    [url, fetchOptions.method, customHeaders],
  );

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial fetch
  fetchData();

  return { data, loading, error, refetch };
}
