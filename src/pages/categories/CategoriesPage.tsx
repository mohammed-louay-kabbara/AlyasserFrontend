import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminCategories, createCategory, updateCategory, deleteCategory, assignProductsToCategory } from "../../api/categories.api";
import { getAdminProducts } from "../../api/products.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { PermissionGuard } from "../../components/auth/PermissionGuard";

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", image: null as File | null });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAdminCategories({ search: search || undefined });
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("فشل في جلب الأصناف");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم الصنف");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    // Only append image if it's a valid File object
    if (formData.image instanceof File) {
      formDataObj.append("image", formData.image);
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formDataObj);
        toast.success("تم تحديث الصنف بنجاح");
      } else {
        await createCategory(formDataObj);
        toast.success("تم إضافة الصنف بنجاح");
      }
      setShowAddModal(false);
      setEditingCategory(null);
      setFormData({ name: "", image: null });
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(editingCategory ? "فشل في تحديث الصنف" : "فشل في إضافة الصنف");
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name , image: null });
    setShowAddModal(true);
  };

  const handleDelete = (categoryId: number) => {
    setConfirmMessage("هل أنت متأكد من حذف هذا الصنف؟");
    setConfirmAction(() => async () => {
      try {
        await deleteCategory(categoryId);
        toast.success("تم حذف الصنف بنجاح");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("فشل في حذف الصنف");
      }
    });
    setShowConfirmModal(true);
  };

  const handleAddProducts = (category: any) => {
    setSelectedCategory(category);
    setShowProductModal(true);
    setProductSearch("");
    setSelectedProducts([]);
    setProductCurrentPage(1);
    fetchProducts();
  };

  const fetchProducts = async (searchTerm?: string) => {
    try {
      setProductsLoading(true);
      const response = await getAdminProducts({
        search: searchTerm || productSearch || undefined,
        page: productCurrentPage,
        per_page: productRowsPerPage
      });
      const productsData = response.data?.products?.data || response.data?.data?.data || response.data?.data || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      setProductTotalPages(response.data?.products?.last_page || response.data?.data?.last_page || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("فشل في جلب المنتجات");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (showProductModal) {
      fetchProducts(productSearch);
    }
  }, [productSearch, showProductModal, productCurrentPage, productRowsPerPage]);

  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const handleAddSelectedProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      toast.error("يرجى تحديد منتج واحد على الأقل");
      return;
    }
    try {
      await assignProductsToCategory(selectedCategory.id, selectedProducts);
      toast.success("تم إضافة المنتجات بنجاح");
      setShowProductModal(false);
      setSelectedCategory(null);
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error adding products to category:", error);
      toast.error("فشل في إضافة المنتجات");
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    return `/storage/${imagePath}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Input
          placeholder="البحث بالاسم"
          value={search}
          onChange={setSearch}
          className="w-64"
        />
        <div className="flex gap-2">
          <Button
            onClick={fetchCategories}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
          <PermissionGuard permissions="create_categories">
            <Button onClick={() => setShowAddModal(true)} className="bg-primary text-white">
              إضافة صنف
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Categories Table */}
      <DataTable
        data={categories}
        loading={loading}
        columns={[
          {
            key: "name",
            label: "اسم الصنف",
            sortable: true
          },
          {
            key: "image",
            label: "الصورة",
            sortable: false,
            render: (value: any, row: any) => (
              value ? (
                <img 
                  src={getImageUrl(value) || ''} 
                  alt={row.name} 
                  className="h-20 w-20 object-cover rounded-lg"
                />
              ) : (
                <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">لا توجد صورة</span>
                </div>
              )
            )
          },
          {
            key: "created_at",
            label: "تاريخ الإنشاء",
            sortable: true,
            render: (value: any) => new Date(value).toLocaleDateString("en-US")
          },
          {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_: any, row: any) => (
              <div className="flex space-x-reverse space-x-2">
                <PermissionGuard permissions="edit_categories">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleEdit(row);
                    }}
                  >
                    تعديل
                  </Button>
                </PermissionGuard>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    navigate(`/categories/${row.id}/products`);
                  }}
                >
                  عرض المنتجات
                </Button>
                <PermissionGuard permissions="edit_categories">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      handleAddProducts(row);
                    }}
                  >
                    إضافة منتجات
                  </Button>
                </PermissionGuard>
                <PermissionGuard permissions="delete_categories">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      handleDelete(row.id);
                    }}
                  >
                    حذف
                  </Button>
                </PermissionGuard>
              </div>
            )
          }
        ]}
        serverSide={false}
        searchable={false}
        emptyMessage="لا توجد أصناف"
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? "تعديل الصنف" : "إضافة صنف جديد"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة الصنف
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(formData.image)} 
                        alt="Category preview" 
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                
                <Input
                  label="اسم الصنف"
                  placeholder="أدخل اسم الصنف"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  required
                />
                
                
                <div className="flex space-x-reverse space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    {editingCategory ? "تحديث" : "إضافة"}
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCategory(null);
                      setFormData({ name: "", image: null });
                    }}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                إضافة منتجات إلى {selectedCategory?.name}
              </h3>

              <form onSubmit={handleAddSelectedProducts}>
                <div className="mb-4">
                  <Input
                    placeholder="البحث عن المنتجات..."
                    value={productSearch}
                    onChange={setProductSearch}
                  />
                </div>

                <div className="max-h-96 overflow-y-auto border rounded-lg mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-right">
                          <input
                            type="checkbox"
                            checked={selectedProducts.length === products.length && products.length > 0}
                            onChange={() => handleSelectAllProducts()}
                          />
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          اسم المنتج
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          السعر
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productsLoading ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            جاري التحميل...
                          </td>
                        </tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            لا توجد منتجات
                          </td>
                        </tr>
                      ) : (
                        products.map((product: any) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleProductSelect(product.id)}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {product.retail_price}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    تم تحديد {selectedProducts.length} منتج
                  </span>
                  {productTotalPages > 1 && (
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => setProductCurrentPage(p => Math.max(1, p - 1))}
                        disabled={productCurrentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        السابق
                      </button>
                      <span className="text-sm text-gray-600">
                        صفحة {productCurrentPage} من {productTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setProductCurrentPage(p => Math.min(productTotalPages, p + 1))}
                        disabled={productCurrentPage === productTotalPages}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        التالي
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex space-x-reverse space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    إضافة ({selectedProducts.length})
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowProductModal(false);
                      setSelectedCategory(null);
                      setSelectedProducts([]);
                      setProductSearch("");
                    }}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

export default CategoriesPage;
