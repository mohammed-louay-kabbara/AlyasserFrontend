import React, { useState, useEffect } from "react";
import DataTable from "./DataTable";
import Button from "./Button";
import { getAdminProducts } from "../../api/products.api";
import toast from "react-hot-toast";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: number[], selectedProducts?: any[]) => void;
  initialSelectedIds: number[];
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedIds,
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const selectedProductsMapRef = React.useRef<Map<number, any>>(new Map());

  useEffect(() => {
    if (isOpen) {
      setSelectedRows(new Set(initialSelectedIds));
      setSearch("");
      setCurrentPage(1);
    }
  }, [isOpen, initialSelectedIds]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAdminProducts({
          search: search || undefined,
          page: currentPage,
          per_page: rowsPerPage,
        });
        const productsData = response.data.products?.data || response.data.products || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setTotalPages(response.data.products?.last_page || 1);
        setTotalItems(response.data.products?.total || 0);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("فشل في جلب المنتجات");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isOpen, search, currentPage, rowsPerPage]);

  if (!isOpen) return null;

  const handleRowSelect = (rowId: number | string, selected: boolean, row?: any) => {
    const newSelected = new Set(selectedRows);
    if (selected) {
      newSelected.add(rowId);
      if (typeof rowId === "number" && row) {
        selectedProductsMapRef.current.set(rowId, row);
      }
    } else {
      newSelected.delete(rowId);
      if (typeof rowId === "number") {
        selectedProductsMapRef.current.delete(rowId);
      }
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = products.map((p) => p.id);
      setSelectedRows(new Set(allIds));
      products.forEach((p) => {
        if (typeof p.id === "number") {
          selectedProductsMapRef.current.set(p.id, p);
        }
      });
    } else {
      setSelectedRows(new Set());
      selectedProductsMapRef.current.clear();
    }
  };

  const handleConfirm = () => {
    const selectedIds = Array.from(selectedRows) as number[];
    const selectedProducts = selectedIds
      .map((id) => selectedProductsMapRef.current.get(id))
      .filter(Boolean);
    onConfirm(selectedIds, selectedProducts);
    onClose();
  };

  const columns = [
    {
      key: "name",
      label: "اسم المنتج",
      sortable: true,
    },
    {
      key: "retail_price",
      label: "السعر",
      sortable: true,
      render: (value: any) => `${value}`,
    },
    {
      key: "category",
      label: "التصنيف",
      sortable: true,
      render: (value: any) => value?.name || "بدون تصنيف",
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60] flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">اختر المنتجات</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <DataTable
            data={products}
            columns={columns}
            loading={loading}
            selectable={true}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            getRowId={(row) => row.id}
            searchable={true}
            searchPlaceholder="ابحث عن منتج..."
            serverSide={true}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(value: number) => {
              setRowsPerPage(value);
              setCurrentPage(1);
            }}
            rowsPerPage={rowsPerPage}
            onSearch={(value: string) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            searchTerm={search}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-primary text-white px-6"
          >
            تأكيد الاختيار ({selectedRows.size})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
