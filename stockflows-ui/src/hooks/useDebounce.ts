import { useState, useEffect } from 'react';

/**
 * Debounce a value with a configurable delay (default 300ms).
 * Returns the debounced value and the raw input for UI display.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
