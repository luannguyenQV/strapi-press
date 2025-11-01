import { useEffect, useState } from 'react';

/**
 * Debounces a value by delaying its update until after a specified delay
 * Useful for search inputs to reduce API calls
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebouncedValue(searchTerm, 300)
 *
 * // API call only triggers after user stops typing for 300ms
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     fetchSearchResults(debouncedSearch)
 *   }
 * }, [debouncedSearch])
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timeout to update the debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
