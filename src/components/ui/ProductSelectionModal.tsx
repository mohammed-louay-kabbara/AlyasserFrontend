import React, { useState, useEffect } from "react";
import DataTable from "./DataTable";
import Button from "./Button";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: number[]) => void;
  products: any[];
  initialSelectedIds: number[];
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  products,
  initialSelectedIds,
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setSelectedRows(new Set(initialSelectedIds));
    }
  }, [isOpen, initialSelectedIds]);

  if (!isOpen) return null;

  const handleRowSelect = (rowId: number | string, selected: boolean) => {
    const newSelected = new Set(selectedRows);
    if (selected) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = products.map((p) => p.id);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedRows) as number[]);
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
            selectable={true}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            getRowId={(row) => row.id}
            searchable={true}
            searchPlaceholder="ابحث عن منتج..."
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
