import { useEffect, useState } from 'react';

/**
 * Debounces a value and returns it after the specified delay.
 * Useful for search inputs to avoid sending too many API requests while typing.
 */
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
