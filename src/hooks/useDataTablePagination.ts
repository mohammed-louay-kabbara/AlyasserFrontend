import { useState } from 'react';

interface DataTablePaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  rowsPerPage: number;
}

interface DataTablePaginationActions {
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  updatePagination: (totalItems: number, totalPages?: number) => void;
}

export const useDataTablePagination = (initialRowsPerPage: number = 20): DataTablePaginationState & DataTablePaginationActions => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const updatePagination = (newTotalItems: number, newTotalPages?: number) => {
    setTotalItems(newTotalItems);
    if (newTotalPages) {
      setTotalPages(newTotalPages);
    } else {
      // Calculate total pages if not provided
      setTotalPages(Math.ceil(newTotalItems / rowsPerPage));
    }
  };

  return {
    currentPage,
    totalPages,
    totalItems,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    updatePagination
  };
};
