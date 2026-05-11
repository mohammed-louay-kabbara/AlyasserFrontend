import React from 'react';
import DataTable from './DataTable';
import { useDataTablePagination } from '../../hooks/useDataTablePagination';

interface DataTableWrapperProps {
  data: any[];
  columns: any[];
  loading?: boolean;
  serverSide?: boolean;
  searchable?: boolean;
  emptyMessage?: string;
  totalItems?: number;
  initialRowsPerPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  currentPage?: number;
  rowsPerPage?: number;
  selectable?: boolean;
  selectedRows?: Set<any>;
  onRowSelect?: (userId: any, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onSearch?: (search: string) => void;
  searchTerm?: string;
}

const DataTableWrapper: React.FC<DataTableWrapperProps> = ({
  data,
  columns,
  loading = false,
  serverSide = true,
  searchable = true,
  emptyMessage = "لا توجد بيانات",
  totalItems = 0,
  initialRowsPerPage = 20,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  onRowsPerPageChange: externalOnRowsPerPageChange,
  currentPage: externalCurrentPage,
  rowsPerPage: externalRowsPerPage,
  selectable = false,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onSearch,
  searchTerm
}) => {
  // Use internal pagination if external props are not provided
  const internalPagination = useDataTablePagination(initialRowsPerPage);
  
  // Use external pagination if provided, otherwise use internal
  const currentPage = externalCurrentPage !== undefined ? externalCurrentPage : internalPagination.currentPage;
  const totalPages = externalTotalPages !== undefined ? externalTotalPages : internalPagination.totalPages;
  const rowsPerPage = externalRowsPerPage !== undefined ? externalRowsPerPage : internalPagination.rowsPerPage;
  
  const onPageChange = externalOnPageChange || internalPagination.onPageChange;
  const onRowsPerPageChange = externalOnRowsPerPageChange || internalPagination.onRowsPerPageChange;

  // Update internal pagination when totalItems changes (only if using internal pagination)
  React.useEffect(() => {
    if (!externalTotalPages && totalItems > 0) {
      internalPagination.updatePagination(totalItems);
    }
  }, [totalItems, internalPagination]);

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      serverSide={serverSide}
      searchable={searchable}
      emptyMessage={emptyMessage}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPage={rowsPerPage}
      selectable={selectable}
      selectedRows={selectedRows}
      onRowSelect={onRowSelect}
      onSelectAll={onSelectAll}
      onSearch={onSearch}
      searchTerm={searchTerm}
    />
  );
};

export default DataTableWrapper;
