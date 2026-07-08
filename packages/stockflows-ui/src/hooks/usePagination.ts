import { useState, useMemo } from 'react';

interface PaginationConfig {
  totalItems: number;
  pageSize?: number;
  currentPage?: number;
}

export function usePagination<T>(
  items: T[],
  config: PaginationConfig
) {
  const { totalItems, pageSize = 10, currentPage: controlledCurrentPage = 1 } = config;
  
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const currentPage = controlledCurrentPage || internalCurrentPage;

  const totalPages = Math.ceil(totalItems / pageSize);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = Math.min(totalPages, 10);
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setInternalCurrentPage(page);
    }
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return {
    items: paginatedItems,
    currentPage,
    totalPages,
    pageSize,
    startIndex,
    endIndex,
    getPageNumbers,
    handlePageChange,
    isFirstPage,
    isLastPage
  };
}

export default usePagination;
