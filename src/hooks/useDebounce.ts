import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 150): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    // Limpiar timeout si cambia value antes del delay
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
