import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminCategories, removeProductFromCategory } from "../../api/categories.api";
import { getAdminProducts, uploadProductImage, deleteProductImage } from "../../api/products.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { getImageUrl, getStockBadge, getStockLabel } from "../../utils/dataTableUtils";
import { CanAccess } from "../../components/auth/CanAccess";

const CategoryProductsPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);

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
    pendingActionRef.current = async () => {
      try {
        await removeProductFromCategory(parseInt(categoryId), productId);
        toast.success("تم إزالة المنتج من الصنف بنجاح");
        fetchProducts();
      } catch (error) {
        console.error("Error removing product from category:", error);
        toast.error("فشل في إزالة المنتج من الصنف");
      }
    };
    setShowConfirmModal(true);
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
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/categories")}
            className="flex items-center gap-2"
          >
            العودة
            {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> */}
              {/* <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /> */}
            {/* </svg> */}
          </Button>
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
            render: (value: any, row: any) => (
              <div>
                {value ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(value) || ''}
                      alt={row.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <CanAccess>
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
                    </CanAccess>
                  </div>
                ) : (
                  <CanAccess>
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
                  </CanAccess>
                )}
              </div>
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
        onConfirm={() => pendingActionRef.current?.()}
        title="تأكيد"
        message={confirmMessage}
        type="danger"
      />
    </div>
  );
};

export default CategoryProductsPage;
