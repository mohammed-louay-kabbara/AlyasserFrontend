import React, { useState, useEffect } from "react";
import DataTableWrapper from "../components/ui/DataTableWrapper";
import { useDataTablePagination } from "../hooks/useDataTablePagination";
import { getImageUrl, getStockBadge, getStockLabel } from "../utils/dataTableUtils";

// Example of how to use reusable DataTable components across different pages

// Method 1: Using DataTableWrapper with external pagination management (recommended for pages with complex state)
const ExamplePageWithExternalPagination: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search] = useState("");
  
  // External pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Your API call here
      // const response = await yourApiFunction({
      //   page: currentPage,
      //   per_page: rowsPerPage,
      //   search
      // });
      
      // Mock data for demonstration
      const mockData = Array.from({ length: rowsPerPage }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: Math.floor(Math.random() * 1000),
        quantity: Math.floor(Math.random() * 50),
        image: null
      }));
      
      setData(mockData);
      setTotalItems(100);
      setTotalPages(Math.ceil(100 / rowsPerPage));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, search]);

  const columns = [
    {
      key: "image",
      label: "الصورة",
      sortable: false,
      render: (value: any) => (
        value ? (
          <img
            src={getImageUrl(value) || ''}
            alt="product"
            className="h-12 w-12 object-cover rounded-lg"
          />
        ) : (
          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">-</span>
          </div>
        )
      )
    },
    {
      key: "name",
      label: "الاسم",
      sortable: true
    },
    {
      key: "price",
      label: "السعر",
      sortable: true,
      render: (value: any) => value
    },
    {
      key: "quantity",
      label: "الكمية",
      sortable: true,
      render: (value: any) => (
        <div className="flex items-center">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockBadge(value)}`}>
            {getStockLabel(value)}
          </span>
          <span className="mr-2 text-sm text-gray-900">{value}</span>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Example Page with External Pagination</h1>
      
      <DataTableWrapper
        data={data}
        columns={columns}
        loading={loading}
        serverSide={true}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
        rowsPerPage={rowsPerPage}
        searchable={true}
        emptyMessage="لا توجد بيانات"
      />
    </div>
  );
};

// Method 2: Using DataTableWrapper with internal pagination (recommended for simple pages)
const ExamplePageWithInternalPagination: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Your API call here - fetch all data at once for client-side pagination
      // const response = await yourApiFunction();
      
      // Mock data for demonstration
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: Math.floor(Math.random() * 1000),
        quantity: Math.floor(Math.random() * 50),
        image: null
      }));
      
      setData(mockData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      key: "name",
      label: "الاسم",
      sortable: true
    },
    {
      key: "price",
      label: "السعر",
      sortable: true,
      render: (value: any) => value
    },
    {
      key: "quantity",
      label: "الكمية",
      sortable: true,
      render: (value: any) => (
        <div className="flex items-center">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockBadge(value)}`}>
            {getStockLabel(value)}
          </span>
          <span className="mr-2 text-sm text-gray-900">{value}</span>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Example Page with Internal Pagination</h1>
      
      <DataTableWrapper
        data={data}
        columns={columns}
        loading={loading}
        serverSide={false} // Use client-side pagination
        totalItems={data.length}
        emptyMessage="لا توجد بيانات"
      />
    </div>
  );
};

// Method 3: Using the pagination hook directly (for maximum flexibility)
const ExamplePageWithHook: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use the pagination hook directly
  const {
    currentPage,
    totalPages,
    totalItems,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    updatePagination
  } = useDataTablePagination(20);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Your API call here
      // const response = await yourApiFunction({
      //   page: currentPage,
      //   per_page: rowsPerPage
      // });
      
      // Mock data for demonstration
      const mockData = Array.from({ length: rowsPerPage }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: Math.floor(Math.random() * 1000),
        quantity: Math.floor(Math.random() * 50),
      }));
      
      setData(mockData);
      updatePagination(100, Math.ceil(100 / rowsPerPage));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage]);

  const columns = [
    {
      key: "name",
      label: "الاسم",
      sortable: true
    },
    {
      key: "price",
      label: "السعر",
      sortable: true,
      render: (value: any) => value
    },
    {
      key: "quantity",
      label: "الكمية",
      sortable: true,
      render: (value: any) => (
        <div className="flex items-center">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockBadge(value)}`}>
            {getStockLabel(value)}
          </span>
          <span className="mr-2 text-sm text-gray-900">{value}</span>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Example Page with Hook</h1>
      
      <DataTableWrapper
        data={data}
        columns={columns}
        loading={loading}
        serverSide={true}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPage={rowsPerPage}
        emptyMessage="لا توجد بيانات"
      />
    </div>
  );
};

export {
  ExamplePageWithExternalPagination,
  ExamplePageWithInternalPagination,
  ExamplePageWithHook
};
