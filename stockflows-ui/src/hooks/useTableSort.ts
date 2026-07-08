import { useState, useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  column: keyof T | null;
  direction: SortDirection;
}

/**
 * Table sorting logic with direction support.
 * Returns sorted data, sort config, and a handler to update sort state.
 */
export function useTableSort<T>(
  data: T[],
  initialColumn?: keyof T,
): {
  sortedData: T[];
  sortConfig: SortConfig<T>;
  handleSort: (column: keyof T) => void;
} {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    column: (initialColumn ?? null) as keyof T,
    direction: initialColumn ? 'asc' : null,
  });

  const handleSort = useCallback(
    (column: keyof T) => {
      setSortConfig((prev) => ({
        column,
        direction:
          prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
    },
    [],
  );

  const sortedData = useMemo(() => {
    if (!sortConfig.column || !sortConfig.direction) return [...data];

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.column];
      const bVal = b[sortConfig.column];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      let comparison: number;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [data, sortConfig]);

  return { sortedData, sortConfig, handleSort };
}
