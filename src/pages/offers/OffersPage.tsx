import React, { useState, useEffect } from "react";
import { getAdminOffers } from "../../api/offers.api";
import { createOffer, deleteOffer, updateOffer } from "../../api/offers.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { getImageUrl } from "../../utils/dataTableUtils";

const OffersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [formData, setFormData] = useState({ description: "", expires_at: "", price: "", image: null as File | string | null, products: [] as Array<{product_id: number, quantity: number}> });
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

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = debouncedSearch ? { search: debouncedSearch } : {};
      const response = await getAdminOffers(params);
      setOffers(response.data.offers || []);
      setProducts(response.data.products || []);
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
  formDataObj.append("price", formData.price.toString());

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
      price: "",
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

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setFormData({
      description: offer.description,
      expires_at: offer.expires_at,
      price: offer.price,
      image: offer.image || null,
      products: offer.products && offer.products.length > 0 
        ? offer.products.map((p: any) => ({ product_id: p.id, quantity: p.pivot?.quantity || 1 }))
        : []
    });
    setShowAddModal(true);
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
          <Button onClick={() => setShowAddModal(true)} className="bg-primary text-white">
            إضافة عرض
          </Button>
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
            render: (value: any) => `${value} ل.س`
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleEdit(row);
                  }}
                >
                  تعديل
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    handleDelete(row.id);
                  }}
                >
                  حذف
                </Button>
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
                
                <Input
                  label="السعر"
                  type="number"
                  placeholder="أدخل سعر العرض"
                  value={formData.price}
                  onChange={(value) => setFormData({ ...formData, price: value })}
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
                  <SearchableSelect
                    options={products}
                    placeholder="اختر منتج"
                    className="mb-2"
                    onChange={(productId) => {
                      if (productId) {
                        setFormData({
                          ...formData,
                          products: [...formData.products, { product_id: productId, quantity: 1 }]
                        });
                      }
                    }}
                  />
                  {formData.products.map((item, index) => {
                    const product = products.find(p => p.id === item.product_id);
                    return (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
                        <span className="text-sm">{product?.name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newProducts = [...formData.products];
                              newProducts[index].quantity = parseInt(e.target.value) || 1;
                              setFormData({ ...formData, products: newProducts });
                            }}
                            className="w-16 px-2 py-1 border rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newProducts = formData.products.filter((_, i) => i !== index);
                              setFormData({ ...formData, products: newProducts });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                        price: "",
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
    </div>
  );
};

export default OffersPage;
