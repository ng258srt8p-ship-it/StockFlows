import { useState, useMemo, useCallback } from 'react';

/**
 * Calculate page numbers and items per page.
 * Returns current page items, total pages, and navigation functions.
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number = 10,
): {
  currentPage: number;
  totalPages: number;
  currentItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPage: Dispatch<SetStateAction<number>>;
  pageNumbers: number[];
} {
  const [currentPage, setPage] = useState<number>(1);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / itemsPerPage)), [items.length, itemsPerPage]);

  const currentItems = useMemo(
    () => items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [items, currentPage, itemsPerPage],
  );

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      setPage(clamped);
    },
    [totalPages],
  );

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pages.push(-1); // ellipsis
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push(-2); // ellipsis

      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage]);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    setPage,
    pageNumbers,
  };
}
