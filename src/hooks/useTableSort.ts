import { useState, useMemo } from 'react';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const useTableSort = <T>(data: T[], initialSort?: SortConfig) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(initialSort);

  const sortedData = useMemo(() => {
    if (!sortConfig || !data) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return 'M7 11l5-5m0 0l5 5m-5-5v12';
    }

    return sortConfig.direction === 'asc' 
      ? 'M7 11l5-5m0 0l5 5m-5-5v12'
      : 'M17 13l-5 5m0 0l-5-5m5 5V6';
  };

  const getSortClass = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return 'text-gray-400';
    }
    return 'text-primary';
  };

  return {
    sortedData,
    sortConfig,
    requestSort,
    getSortIcon,
    getSortClass
  };
};
