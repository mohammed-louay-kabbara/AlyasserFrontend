import React, { useState, useEffect, useRef } from "react";
import { getAdminProducts, syncWithAmeen, uploadProductImage, deleteProductImage, exportProductsExcel, exportProductsPdf } from "../../api/products.api";
import { getAdminCategories } from "../../api/categories.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { getImageUrl, getStockBadge, getStockLabel } from "../../utils/dataTableUtils";
import { CanAccess } from "../../components/auth/CanAccess";

const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, categoryFilter, stockFilter, currentPage, rowsPerPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts({
        search: search || undefined,
        category_id: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined,
        stock_status: stockFilter !== "all" ? stockFilter : undefined,
        page: currentPage,
        per_page: rowsPerPage
      });
      const productsData = response.data.products?.data || response.data.products || [];
      setProducts(productsData);
      setTotalPages(response.data.products?.last_page || 1);
      setTotalProducts(response.data.products?.total || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("فشل في جلب المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAdminCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSyncWithAmeen = () => {
    setConfirmMessage("هل أنت متأكد من بدء المزامنة مع نظام الأمين؟ قد تستغرق هذه العملية بعض الوقت.");
    pendingActionRef.current = async () => {
      try {
        setSyncing(true);
        const response = await syncWithAmeen();
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
        fetchProducts();
      } catch (error) {
        console.error("Error syncing with Ameen:", error);
        toast.error("فشل في المزامنة مع نظام الأمين");
      } finally {
        setSyncing(false);
      }
    };
    setShowConfirmModal(true);
  };

  const handleExportExcel = async () => {
    if (selectedProducts.length === 0) {
      toast.error("يرجى تحديد منتج واحد على الأقل للتصدير");
      return;
    }
    try {
      const response = await exportProductsExcel(selectedProducts);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("تم تصدير المنتجات المحددة إلى Excel");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("فشل في التصدير إلى Excel");
    }
  };

  const handleExportPdf = async () => {
    if (selectedProducts.length === 0) {
      toast.error("يرجى تحديد منتج واحد على الأقل للتصدير");
      return;
    }
    try {
      const response = await exportProductsPdf(selectedProducts);
      
      // Check if response is an error
      if (response.data && typeof response.data === 'string' && response.data.startsWith('{"status"')) {
        const errorData = JSON.parse(response.data);
        toast.error(errorData.message || "فشل في التصدير إلى PDF");
        return;
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("تم تصدير المنتجات المحددة إلى PDF");
    } catch (error: any) {
      console.error("Error exporting to PDF:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("فشل في التصدير إلى PDF");
      }
    }
  };

  const handleSelectProduct = (productId: number, selected: boolean) => {
    if (selected) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleImageUpload = async (productId: number, imageFile: File) => {
    try {
      await uploadProductImage(productId, imageFile);
      toast.success("تم رفع الصورة بنجاح");
      fetchProducts();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("فشل في رفع الصورة");
    }
  };

  const handleDeleteImage = (productId: number) => {
    setConfirmMessage("هل أنت متأكد من حذف صورة هذا المنتج؟");
    pendingActionRef.current = async () => {
      try {
        await deleteProductImage(productId);
        toast.success("تم حذف الصورة بنجاح");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product image:", error);
        toast.error("فشل في حذف الصورة");
      }
    };
    setShowConfirmModal(true);
  };

  
  
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="البحث بالاسم"
            value={search}
            onChange={setSearch}
            className="w-64"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">جميع الأصناف</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">جميع الحالات</option>
            <option value="available">متوفر</option>
            <option value="low_stock">مخزون منخفض</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchProducts}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
          <CanAccess permission="create_products">
            <Button
              onClick={handleSyncWithAmeen}
              disabled={syncing}
              className="bg-purple-600 text-white"
            >
              {syncing ? "جاري المزامنة..." : "مزامنة مع الأمين"}
            </Button>
          </CanAccess>
          <CanAccess permission="export_products">
            <Button
              onClick={handleExportExcel}
              className="bg-green-600 text-white"
            >
              تصدير Excel
            </Button>
          </CanAccess>
          <CanAccess permission="export_products">
            <Button
              onClick={handleExportPdf}
              className="bg-red-600 text-white"
            >
              تصدير PDF
            </Button>
          </CanAccess>
        </div>
      </div>

      <DataTableWrapper
        data={products}
        loading={loading}
        columns={[
          {
            key: "image",
            label: "الصورة",
            sortable: false,
            render: (value: any, row: any) => (
              <div>
                {value ? (
                  <div className="relative">
                    <img 
                      src={getImageUrl(value) || ''} 
                      alt={row.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(row.id);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs hover:bg-red-600"
                      title="حذف الصورة"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0l4.586 4.586a2 2 0 012.828 0l-4.586-4.586a2 2 0 00-2.828 0z" />
                      </svg>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        e.stopPropagation();
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(row.id, file);
                      }}
                    />
                  </label>
                )}
              </div>
            )
          },
          {
            key: "name",
            label: "الاسم",
            sortable: true
          },
          {
            key: "retail_price",
            label: "سعر القطعة",
            sortable: true,
            render: (value: any) => value
          },
          {
            key: "wholesale_price",
            label: "سعر الطرد",
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
          },
          {
            key: "category_id",
            label: "الصنف",
            sortable: false,
            render: (value: any) => {
              if (!value) return "-";
              const cat = categories.find((c: any) => c.id === parseInt(value));
              return cat?.name || "-";
            }
          }
        ]}
        serverSide={true}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalProducts}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value: number) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
        rowsPerPage={rowsPerPage}
        onSearch={setSearch}
        searchTerm={search}
        searchable={false}
        selectable={true}
        selectedRows={new Set(selectedProducts)}
        onRowSelect={(productId: number, selected: boolean) => handleSelectProduct(productId, selected)}
        onSelectAll={handleSelectAll}
        emptyMessage="لا توجد منتجات"
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          if (pendingActionRef.current) {
            pendingActionRef.current();
          }
        }}
        title="تأكيد"
        message={confirmMessage}
        type="warning"
      />
    </div>
  );
};

export default ProductsPage;
