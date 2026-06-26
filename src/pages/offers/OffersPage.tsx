import React, { useState, useEffect } from "react";
import { createOffer, deleteOffer, getAdminOffer, getAdminOffers, updateOffer } from "../../api/offers.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ProductSelectionModal from "../../components/ui/ProductSelectionModal";
import { PermissionGuard } from "../../components/auth/PermissionGuard";
import { getImageUrl } from "../../utils/dataTableUtils";

const OffersPage: React.FC = () => {
  const mergeProductsById = (existingProducts: any[], incomingProducts: any[]) => {
    const productsMap = new Map(existingProducts.map((product) => [product.id, product]));
    incomingProducts.forEach((product) => {
      productsMap.set(product.id, product);
    });
    return Array.from(productsMap.values());
  };

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [formData, setFormData] = useState({ description: "", expires_at: "", image: null as File | string | null, products: [] as Array<{product_id: number, quantity: number, purchase_type: string, provided: boolean}> });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce main search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchOffers();
  }, [debouncedSearch]);

  const handleConfirmProducts = (selectedIds: number[], selectedProducts: any[] = []) => {
    const currentProducts = [...formData.products];
    
    // Filter out products that are no longer selected
    const filteredProducts = currentProducts.filter(p => selectedIds.includes(p.product_id));
    
    // Add new products that were just selected
    const newProducts = selectedIds
      .filter(id => !currentProducts.some(p => p.product_id === id))
      .map(id => ({
        product_id: id,
        quantity: 1,
        purchase_type: "طرد",
        provided: false
      }));

    setFormData({
      ...formData,
      products: [...filteredProducts, ...newProducts]
    });

    if (selectedProducts.length > 0) {
      setProducts((prev) => mergeProductsById(prev, selectedProducts));
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = debouncedSearch ? { search: debouncedSearch } : {};
      const response = await getAdminOffers(params);
      setOffers(response.data.offers || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("فشل في جلب العروض");
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // التحقق من وجود الصورة (مطلوبة فقط عند الإضافة)
  if (!editingOffer && !formData.image) {
    toast.error("يرجى اختيار صورة للعرض");
    return;
  }

  const formDataObj = new FormData();
  
  // إضافة الحقول النصية
  formDataObj.append("description", formData.description);
  formDataObj.append("expires_at", formData.expires_at);

  // إضافة الصورة (فقط إذا تم اختيار صورة جديدة)
  if (formData.image instanceof File) {
    formDataObj.append("image", formData.image);
  }

  // إضافة المنتجات (Products Array) كـ JSON string
  formDataObj.append("products", JSON.stringify(formData.products));

  try {
    setLoading(true);
    if (editingOffer) {
      await updateOffer(editingOffer.id, formDataObj);
      toast.success("تم تحديث العرض بنجاح");
    } else {
      await createOffer(formDataObj);
      toast.success("تم إنشاء العرض بنجاح");
    }
    setShowAddModal(false);
    setEditingOffer(null);
    setFormData({
      description: "",
      expires_at: "",
      image: null,
      products: []
    });
    fetchOffers();
  } catch (error) {
    console.error("Error saving offer:", error);
    toast.error(editingOffer ? "فشل في تحديث العرض" : "فشل في إنشاء العرض");
  } finally {
    setLoading(false);
  }
};

  const handleEdit = async (offer: any) => {
    try {
      setLoading(true);
      const response = await getAdminOffer(offer.id);
      const offerData = response.data?.offer || response.data;

      setEditingOffer(offerData);
      setProducts((prev) => mergeProductsById(prev, offerData.products || []));
      setFormData({
        description: offerData.description,
        expires_at: offerData.expires_at,
        image: offerData.image || null,
        products: offerData.products && offerData.products.length > 0
          ? offerData.products.map((p: any) => ({ product_id: p.id, quantity: p.pivot?.quantity || 1, purchase_type: p.pivot?.purchase_type || "طرد", provided: p.pivot?.provided === "1" || p.pivot?.provided === 1 || p.pivot?.provided === true }))
          : []
      });
      setShowAddModal(true);
    } catch (error) {
      console.error("Error fetching offer details:", error);
      toast.error("فشل في جلب بيانات العرض");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (offerId: number) => {
    setOfferToDelete(offerId);
    setConfirmMessage("هل أنت متأكد من حذف هذا العرض؟");
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (offerToDelete) {
      try {
        await deleteOffer(offerToDelete);
        toast.success("تم حذف العرض بنجاح");
        fetchOffers();
      } catch (error) {
        console.error("Error deleting offer:", error);
        toast.error("فشل في حذف العرض");
      }
    }
    setShowConfirmModal(false);
    setOfferToDelete(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Input
          placeholder="البحث بالوصف"
          value={search}
          onChange={setSearch}
          className="w-64"
        />
        <div className="flex gap-2">
          <Button
            onClick={fetchOffers}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
          <PermissionGuard permissions="create_offers">
            <Button onClick={() => setShowAddModal(true)} className="bg-primary text-white">
              إضافة عرض
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <DataTableWrapper
        data={offers}
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
                  alt="Offer" 
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
            key: "description",
            label: "الوصف",
            sortable: true,
            render: (value: any, row: any) => (
              <div>
                <div className="text-sm text-gray-900">{value}</div>
                {row.product && (
                  <div className="text-xs text-gray-500 mt-1">
                    المنتج: {row.product.name}
                  </div>
                )}
              </div>
            )
          },
          {
            key: "price",
            label: "السعر",
            sortable: true,
            render: (value: any) => `${value}`
          },
          {
            key: "expires_at",
            label: "تاريخ الانتهاء",
            sortable: true,
            render: (value: any) => new Date(value).toLocaleDateString("en-US")
          },
          {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_: any, row: any) => (
              <div className="flex space-x-reverse space-x-2">
                <PermissionGuard permissions="edit_offers">
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
                <PermissionGuard permissions="delete_offers">
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
        emptyMessage="لا توجد عروض"
      />

      {/* Add/Edit Offer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingOffer ? "تعديل العرض" : "إضافة عرض جديد"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة العرض
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required={!editingOffer}
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={typeof formData.image === 'string' 
                          ? `http://alyasser-center.com:8080/storage/${formData.image}`
                          : URL.createObjectURL(formData.image)
                        } 
                        alt="Offer preview" 
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                
                <Input
                  label="الوصف"
                  placeholder="أدخل وصف العرض"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  required
                />
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المنتجات
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProductModal(true)}
                    className="w-full mb-4 flex items-center justify-center gap-2 border-dashed border-2 hover:border-primary hover:text-primary transition-all"
                  >
                    <span>📦</span>
                    {formData.products.length > 0 ? "تعديل المنتجات المختارة" : "اختيار المنتجات"}
                  </Button>

                  {formData.products.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                      {formData.products.map((item, index) => {
                        const product = products.find(p => p.id === item.product_id);
                        return (
                          <div key={index} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-gray-800">{product?.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newProducts = formData.products.filter((_, i) => i !== index);
                                  setFormData({ ...formData, products: newProducts });
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={item.purchase_type}
                                onChange={(e) => {
                                  const newProducts = [...formData.products];
                                  newProducts[index].purchase_type = e.target.value;
                                  setFormData({ ...formData, products: newProducts });
                                }}
                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                              >
                                <option value="طرد">طرد</option>
                                <option value="قطعة">قطعة</option>
                              </select>
                              <div className="flex items-center gap-1 w-24">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newProducts = [...formData.products];
                                    newProducts[index].quantity = parseInt(e.target.value) || 1;
                                    setFormData({ ...formData, products: newProducts });
                                  }}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:outline-none text-center"
                                />
                                <span className="text-xs text-gray-500">الكمية</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={item.provided}
                                  onChange={(e) => {
                                    const newProducts = [...formData.products];
                                    newProducts[index].provided = e.target.checked;
                                    setFormData({ ...formData, products: newProducts });
                                  }}
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-xs text-gray-500">مُقدم</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400 text-sm">
                      لم يتم اختيار أي منتج بعد
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-reverse space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    {editingOffer ? "تحديث" : "إضافة"}
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingOffer(null);
                      setFormData({
                        description: "",
                        expires_at: "",
                        image: null,
                        products: []
                      });
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
        onConfirm={handleConfirmDelete}
        title="تأكيد"
        message={confirmMessage}
        type="danger"
      />

      <ProductSelectionModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onConfirm={handleConfirmProducts}
        initialSelectedIds={formData.products.map(p => p.product_id)}
      />
    </div>
  );
};

export default OffersPage;
