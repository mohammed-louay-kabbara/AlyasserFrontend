import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminCategories, removeProductFromCategory } from "../../api/categories.api";
import { getAdminProducts } from "../../api/products.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { getImageUrl, getStockBadge, getStockLabel } from "../../utils/dataTableUtils";

const CategoryProductsPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryName();
      fetchProducts();
    }
  }, [categoryId, search, currentPage, rowsPerPage]);

  const fetchCategoryName = async () => {
    try {
      const response = await getAdminCategories();
      const cats = response.data || [];
      setCategories(cats);
                } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts({
        category_id: categoryId ? parseInt(categoryId) : undefined,
        search: search || undefined,
        page: currentPage,
        per_page: rowsPerPage
      });
      const productsData = response.data?.products?.data || response.data?.data?.data || response.data?.data || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      setTotalPages(response.data?.products?.last_page || response.data?.data?.last_page || 1);
      setTotalProducts(response.data?.products?.total || response.data?.data?.total || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("فشل في جلب المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    if (!categoryId) return;
    setConfirmMessage("هل أنت متأكد من إزالة هذا المنتج من الصنف؟");
    setConfirmAction(() => async () => {
      try {
        await removeProductFromCategory(parseInt(categoryId), productId);
        toast.success("تم إزالة المنتج من الصنف بنجاح");
        fetchProducts();
      } catch (error) {
        console.error("Error removing product from category:", error);
        toast.error("فشل في إزالة المنتج من الصنف");
      }
    });
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
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/categories")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <Button
            onClick={fetchProducts}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
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
            label: "اسم المنتج",
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
          },
          {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_: any, row: any) => (
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  handleRemoveProduct(row.id);
                }}
              >
                إزالة من الصنف
              </Button>
            )
          }
        ]}
        serverSide={true}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalProducts}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
        rowsPerPage={rowsPerPage}
        searchable={false}
        emptyMessage="لا توجد منتجات في هذا الصنف"
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => confirmAction?.()}
        title="تأكيد"
        message={confirmMessage}
        type="danger"
      />
    </div>
  );
};

export default CategoryProductsPage;
