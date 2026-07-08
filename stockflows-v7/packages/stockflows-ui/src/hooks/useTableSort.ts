import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc' | null;

interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
}

export function useTableSort<T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnConfig[]
) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection }>({
    key: '',
    direction: null
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    const sortableColumns = columns.filter(col => col.sortable !== false);
    if (!sortableColumns.find(col => col.key === sortConfig.key)) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;

      const aStr = String(aVal);
      const bStr = String(bVal);

      let comparison = 0;
      if (aStr < bStr) comparison = -1;
      else comparison = 1;

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });

    return sorted;
  }, [data, sortConfig, columns]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: '', direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortDirection = (key: string): SortDirection => {
    return sortConfig.key === key ? sortConfig.direction : null;
  };

  return {
    data: sortedData,
    sortConfig,
    handleSort,
    getSortDirection
  };
}

export default useTableSort;
