import React, { useState, useMemo } from "react";
import Input from "./Input";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  checkbox?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  // Server-side pagination props
  serverSide?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPage?: number;
  onSearch?: (searchTerm: string) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  searchTerm?: string;
  // Checkbox selection props
  selectable?: boolean;
  selectedRows?: Set<number | string>;
  onRowSelect?: (rowId: number | string, selected: boolean, row?: T) => void;
  onSelectAll?: (selected: boolean) => void;
  getRowId?: (row: T) => number | string;
}

function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "لا توجد بيانات",
  searchable = true,
  searchPlaceholder = "بحث...",
  onRowClick,
  serverSide = false,
  currentPage: externalCurrentPage = 1,
  totalPages: externalTotalPages,
  totalItems: externalTotalItems,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPage: externalRowsPerPage = 20,
  onSearch,
  onSort,
  sortColumn: externalSortColumn,
  sortDirection: externalSortDirection,
  searchTerm: externalSearchTerm,
  selectable = false,
  selectedRows = new Set(),
  onRowSelect,
  onSelectAll,
  getRowId = (row: T) => (row as any).id,
}: DataTableProps<T>) {
  // Client-side state
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalSortColumn, setInternalSortColumn] = useState<string>("");
  const [internalSortDirection, setInternalSortDirection] = useState<"asc" | "desc">("asc");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);

  // Use external or internal state based on serverSide
  const searchTerm = serverSide ? externalSearchTerm || "" : internalSearchTerm;
  const sortColumn = serverSide ? externalSortColumn || "" : internalSortColumn;
  const sortDirection = serverSide ? externalSortDirection || "asc" : internalSortDirection;
  const currentPage = serverSide ? externalCurrentPage : internalCurrentPage;
  const rowsPerPage = serverSide ? externalRowsPerPage : internalRowsPerPage;

  // Client-side filtering and sorting
  const processedData = useMemo(() => {
    if (serverSide) return Array.isArray(data) ? data : [];

    let result = Array.isArray(data) ? data : [];

    // Filter
    if (searchTerm) {
      result = result.filter((row) => {
        return columns.some((column) => {
          const value = row[column.key as keyof T];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Sort
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortColumn as keyof T];
        const bValue = b[sortColumn as keyof T];

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, columns, serverSide]);

  // Client-side pagination
  const safeData = Array.isArray(data) ? data : [];
  const totalPages = serverSide ? externalTotalPages || 1 : Math.ceil(processedData.length / rowsPerPage);
  const totalItems = serverSide ? externalTotalItems || safeData.length : processedData.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = serverSide ? safeData : processedData.slice(startIndex, startIndex + rowsPerPage);

  const handleSort = (columnKey: string) => {
    const newDirection = sortColumn === columnKey && sortDirection === "asc" ? "desc" : "asc";
    
    if (serverSide && onSort) {
      onSort(columnKey, newDirection);
    } else {
      setInternalSortColumn(columnKey);
      setInternalSortDirection(newDirection);
    }
  };

  const handlePageChange = (page: number) => {
    if (serverSide && onPageChange) {
      onPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (value: number) => {
    if (serverSide && onRowsPerPageChange) {
      onRowsPerPageChange(value);
    } else {
      setInternalRowsPerPage(value);
      setInternalCurrentPage(1);
    }
  };

  const handleSearchChange = (value: string) => {
    if (serverSide && onSearch) {
      onSearch(value);
    } else {
      setInternalSearchTerm(value);
      setInternalCurrentPage(1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-64"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(getRowId(row)))}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortColumn === column.key ? (
                          sortDirection === "asc" ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  جاري التحميل...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(getRowId(row))}
                        onChange={(e) => {
                          e.stopPropagation();
                          onRowSelect?.(getRowId(row), e.target.checked, row);
                        }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key as keyof T], row) : String(row[column.key as keyof T] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">عرض</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">صفوف</span>
          </div>
          {totalItems > 0 && (
            <div className="text-sm text-gray-700">
              عرض {startIndex + 1} إلى {Math.min(startIndex + rowsPerPage, totalItems)} من {totalItems}
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 border rounded-lg ${
                    currentPage === pageNum
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
