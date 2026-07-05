import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminOrderDetail, getAdminOrderDetailByNumber, updateOrderStatus, exportOrderToAmeenTxt, addOrderItem, deleteOrderItem, toggleOrderSync } from "../../api/orders.api";
import { getAdminUsers } from "../../api/users.api";
import { searchAdminProducts } from "../../api/products.api";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import OrderBill from "../../components/print/OrderBill";

import { PermissionGuard } from "../../components/auth/PermissionGuard";
import { CanAccess } from "../../components/auth/CanAccess";
import { useAuthStore } from "../../store/authStore";

const OrderDetailPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const printRef = React.useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const [showPrintView, setShowPrintView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPurchaseType, setNewItemPurchaseType] = useState("طرد");
  const [editedItems, setEditedItems] = useState<Record<number, { quantity: number; purchase_type: string }>>({});
  const [itemsToAdd, setItemsToAdd] = useState<Array<{ product: any; quantity: number; purchase_type: string }>>([]);
  const [itemsToDelete, setItemsToDelete] = useState<Set<number>>(new Set());
  const [savingChanges, setSavingChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      if (/^emp_/i.test(orderNumber)) {
        navigate(`/orders/user/${orderNumber}`, { replace: true });
        return;
      }
      fetchOrderDetail();
    }
  }, [orderNumber]);

  const handleProductSearch = async (value: string) => {
    setProductSearch(value);
    if (value.length > 0) {
      try {
        const response = await searchAdminProducts({ search: value });
        setProductSuggestions(response.data?.data || response.data || []);
      } catch (error) {
        console.error("Error searching products:", error);
        setProductSuggestions([]);
      }
    } else {
      setProductSuggestions([]);
    }
  };

  const handleOpenProductModal = async () => {
    if (productSearch.length > 0) {
      setIsModalOpen(true);
    }
  };

  const handleSelectProductFromModal = (product: any) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setIsModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleOpenProductModal();
    }
  };


  const handleAddItem = () => {
    if (!selectedProduct) return;
    const newItem = {
      product: selectedProduct,
      quantity: newItemQuantity,
      purchase_type: newItemPurchaseType,
    };
    setItemsToAdd([...itemsToAdd, newItem]);
    toast.success("تمت إضافة المنتج إلى القائمة");
    setProductSearch("");
    setSelectedProduct(null);
    setNewItemQuantity(1);
    setNewItemPurchaseType("طرد");
  };

  const handleDeleteItem = (itemId: number) => {
    setItemsToDelete(new Set([...itemsToDelete, itemId]));
    toast.success("تم وضع علامة للحذف");
  };

  const handleUndoDelete = (itemId: number) => {
    const newSet = new Set(itemsToDelete);
    newSet.delete(itemId);
    setItemsToDelete(newSet);
  };

  const handleSaveAllChanges = async () => {
    if (!order) return;
    try {
      setSavingChanges(true);

      // Delete items
      for (const itemId of itemsToDelete) {
        await deleteOrderItem(Number(order.id), itemId);
      }

      // Add new items
      for (const item of itemsToAdd) {
        await addOrderItem(Number(order.id), {
          product_id: item.product.id,
          quantity: item.quantity,
          purchase_type: item.purchase_type,
        });
      }

      // Update existing items (delete and re-add for now)
      for (const [itemId, changes] of Object.entries(editedItems)) {
        const item = order.items?.find((i: any) => i.id === Number(itemId));
        if (item) {
          await deleteOrderItem(Number(order.id), Number(itemId));
          await addOrderItem(Number(order.id), {
            product_id: item.product_id,
            quantity: changes.quantity,
            purchase_type: changes.purchase_type,
          });
        }
      }

      toast.success("تم حفظ جميع التغييرات بنجاح");
      setEditedItems({});
      setItemsToAdd([]);
      setItemsToDelete(new Set());
      setIsEditing(false);
      fetchOrderDetail();
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast.error(error.response?.data?.message || "فشل في حفظ التغييرات");
    } finally {
      setSavingChanges(false);
    }
  };

  const handleSyncToggle = async () => {
    if (!order) return;
    try {
      await toggleOrderSync(Number(order.id));
      toast.success("تم تحديث حالة المزامنة بنجاح");
      fetchOrderDetail();
    } catch (error: any) {
      console.error("Error toggling sync status:", error);
      toast.error(error.response?.data?.message || "فشل في تحديث حالة المزامنة");
    }
  };

  const handleCancelEditing = () => {
    setEditedItems({});
    setItemsToAdd([]);
    setItemsToDelete(new Set());
    setIsEditing(false);
  };

  const handleItemEdit = (itemId: number, field: 'quantity' | 'purchase_type', value: any) => {
    setEditedItems({
      ...editedItems,
      [itemId]: {
        ...editedItems[itemId],
        [field]: value,
      },
    });
  };

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);

      // Try admin endpoint first
      let response;
      try {
        response = await getAdminOrderDetailByNumber(orderNumber!);
        console.log('Admin order detail response:', response);
      } catch (adminError: any) {
        console.log('Admin endpoint failed, trying public endpoint:', adminError);
        const numericId = Number(orderNumber);
        if (!Number.isFinite(numericId)) {
          throw adminError;
        }
        response = await getAdminOrderDetail(numericId);
        console.log('Public order detail response:', response);
      }

      console.log('Response data:', response.data);

      // Handle different response structures
      let orderData;
      if (response.data?.order) {
        orderData = response.data.order;
      } else if (response.data?.data) {
        orderData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Public endpoint returns array
        orderData = response.data[0];
      } else if (response.data) {
        orderData = response.data;
      } else {
        orderData = response;
      }

      // console.log('Extracted order data:', orderData);

      if (!orderData) {
        console.error('Order data is null');
        toast.error("بيانات الطلب فارغة");
        setOrder(null);
      } else {
        setOrder(orderData);
        // setNotes(orderData?.notes || "");
        setStatus(orderData?.status || "");

        // Use user data from the order response
        if (orderData.user) {
          setUser(orderData.user);
        } else if (orderData.user_id) {
          // Fallback: fetch user details separately if not included
          try {
            console.log('Fetching all users to find user_id:', orderData.user_id);
            const usersResponse = await getAdminUsers();
            console.log('Users response:', usersResponse);
            const usersData = usersResponse.data || [];
            const userData = usersData.find((u: any) => u.id === Number(orderData.user_id));
            console.log('Found user data:', userData);
            setUser(userData || null);
          } catch (userError: any) {
            console.error('Error fetching user details:', userError);
            console.error('User error response:', userError.response);
            setUser(null);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching order detail:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "فشل في جلب تفاصيل الطلب");
    } finally {
      setLoading(false);
    }
  };

  const handleExportToAmeen = async () => {
    if (!order) return;
    try {
      setExporting(true);
      const response = await exportOrderToAmeenTxt(order.id);
      const blob = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ameen_${order.order_number || order.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير الطلب بنجاح");
    } catch (error: any) {
      console.error("Error exporting order to Ameen:", error);
      toast.error("فشل في تصدير الطلب");
    } finally {
      setExporting(false);
    }
  };



  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      await updateOrderStatus(Number(order?.id), newStatus);
      toast.success("تم تحديث حالة الطلب بنجاح");
      fetchOrderDetail();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("فشل في تحديث حالة الطلب");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order-${order?.id}`,
    onAfterPrint: () => setShowPrintView(false),
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      completed: "bg-green-600 text-white",
      rejected: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">الطلب غير موجود</div>
      </div>
    );
  }
  const normalizedStatus = status === "completed" ? "delivered" : status;

  return (
    <div>
      {showPrintView ? (
        <div className="flex justify-end gap-2">
          <Button onClick={() => setShowPrintView(false)} variant="outline">
            العودة
          </Button>
          <PermissionGuard permissions="print_orders">
            <Button onClick={handlePrint} className="bg-blue-600 text-white">
              طباعة
            </Button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              العودة
            </Button>
            <Button
              onClick={fetchOrderDetail}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span>🔄</span>
              تحديث
            </Button>
            <CanAccess permission="view_orders">
              <Button
                onClick={handleExportToAmeen}
                disabled={exporting}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                {/* <span>📥</span> */}
                {exporting ? "جاري التصدير..." : "فاتورة الأمين"}
              </Button>
            </CanAccess>
            <PermissionGuard permissions="print_orders">
              <Button onClick={() => setShowPrintView(true)} className="bg-blue-600 text-white">
                طباعة
              </Button>
            </PermissionGuard>
          </div>
        </div>
      )}

      {showPrintView ? (
        <div ref={printRef}>
          <OrderBill order={order} user={user} />
        </div>
      ) : (
        <div ref={printRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الطلب</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الطلب </label>
                  <p className="text-lg font-bold text-gray-900">{order.order_number || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع التوصيل</label>
                  <p className="text-lg font-medium text-gray-900">{order.delivery_type == "delivery" ? "توصيل" : "مركز"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  {hasPermission("manage_orders") ? (
                    <select
                      value={normalizedStatus}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        handleStatusChange(e.target.value);
                      }}
                      className={`px-3 py-1 text-sm font-semibold rounded-lg border-2 ${getStatusBadge(status)} focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="pending">معلق</option>
                      <option value="confirmed">موافق عليه</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="delivered">تم التسليم</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-lg border-2 ${getStatusBadge(status)}`}>
                      {status == 'pending' ? 'معلق' : status == 'confirmed' ? 'موافق عليه' : status == 'processing' ? 'قيد المعالجة' : status == 'delivered' ? 'تم التسليم' : status == 'delivered' ? 'تم التسليم' : status}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString("en-US")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مزامن</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={order.is_synced === true || order.is_synced === 1 || order.is_synced === "1"}
                      readOnly={order.is_synced === true || order.is_synced === 1 || order.is_synced === "1"}
                      onClick={(e) => {
                        e.stopPropagation();

                        if (order.is_synced === true || order.is_synced === 1 || order.is_synced === "1") {
                          e.preventDefault();
                          return;
                        }

                        handleSyncToggle();
                      }}
                      className={`w-5 h-5 accent-blue-600 border-gray-300 rounded focus:ring-blue-500 ${order.is_synced === true || order.is_synced === 1 || order.is_synced === "1" ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                    />
                  </div>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <p className="text-gray-900">{order.notes || "-"}</p>
              </div>

            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">عناصر الطلب</h2>
                {hasPermission("manage_orders") && (
                  <div className="flex gap-2">
                    {isEditing && (
                      <>
                        <Button
                          onClick={handleCancelEditing}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          إلغاء
                        </Button>
                        <Button
                          onClick={handleSaveAllChanges}
                          disabled={savingChanges || (Object.keys(editedItems).length === 0 && itemsToAdd.length === 0 && itemsToDelete.size === 0)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {savingChanges ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? "outline" : "primary"}
                      className={isEditing ? "border-red-500 text-red-500 hover:bg-red-50" : ""}
                    >
                      {isEditing ? "إغلاق" : "تعديل الطلب"}
                    </Button>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم المنتج</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">السعر الفردي</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">المجموع</th>
                      {isEditing && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items?.map((item: any, index: number) => {
                      const isOffer = item.purchase_type === 'عرض' || item.offer_id;
                      const name = isOffer
                        ? item.offer?.description || 'عرض'
                        : item.product?.name || 'منتج';
                      const quantity = item.quantity || 0;
                      const purchaseType = item.purchase_type || '-';
                      const isMarkedForDelete = itemsToDelete.has(item.id);
                      const editedItem = editedItems[item.id];
                      const currentQuantity = editedItem?.quantity ?? quantity;
                      const currentPurchaseType = editedItem?.purchase_type ?? purchaseType;
                      const price = isOffer
                        ? (item.unit_price || item.price || 0)
                        : (currentPurchaseType === 'طرد'
                          ? (item.product?.wholesale_price || item.unit_price || item.price || 0)
                          : (item.product?.retail_price || item.unit_price || item.price || 0));

                      return (
                        <tr key={index} className={`hover:bg-gray-50 transition-colors ${isMarkedForDelete ? 'bg-red-50 opacity-60' : ''}`}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex flex-col">
                              <span>{name}</span>
                              {isOffer && (
                                <span className="inline-flex items-center w-fit mt-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  عرض
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                            {isEditing && !isOffer ? (
                              <input
                                type="number"
                                min="1"
                                value={currentQuantity}
                                onChange={(e) => handleItemEdit(item.id, 'quantity', Number(e.target.value))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                              />
                            ) : (
                              quantity
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                            {isEditing && !isOffer ? (
                              <select
                                value={currentPurchaseType}
                                onChange={(e) => handleItemEdit(item.id, 'purchase_type', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="طرد">طرد</option>
                                <option value="قطعة">قطعة</option>
                              </select>
                            ) : (
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${purchaseType === 'طرد' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {purchaseType}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-700 font-mono">
                            {price.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-left text-primary font-bold font-mono">
                            {(currentQuantity * price).toLocaleString()}
                          </td>
                          {isEditing && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                              {isMarkedForDelete ? (
                                <button
                                  onClick={() => handleUndoDelete(item.id)}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  تراجع
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-red-600 hover:text-red-800 font-medium"
                                >
                                  حذف
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {isEditing && (
                      <tr className="bg-blue-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="relative">
                            <input
                              type="text"
                              value={productSearch}
                              onChange={(e) => handleProductSearch(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="ابحث عن منتج واضغط ENTER..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={newItemPurchaseType}
                            onChange={(e) => setNewItemPurchaseType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="طرد">طرد</option>
                            <option value="قطعة">قطعة</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-700 font-mono">
                          {selectedProduct ? (newItemPurchaseType === 'طرد'
                            ? (selectedProduct.wholesale_price || selectedProduct.price || 0)
                            : (selectedProduct.retail_price || selectedProduct.price || 0)).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-left text-primary font-bold font-mono">
                          {selectedProduct ? ((newItemPurchaseType === 'طرد'
                            ? (selectedProduct.wholesale_price || selectedProduct.price || 0)
                            : (selectedProduct.retail_price || selectedProduct.price || 0)) * newItemQuantity).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                          <button
                            onClick={handleAddItem}
                            disabled={!selectedProduct}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            إضافة للقائمة
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {(!order.items || order.items.length === 0) && (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-b-lg">لا توجد عناصر</p>
                )}

                {/* Items pending to be added */}
                {isEditing && itemsToAdd.length > 0 && (
                  <div className="mt-4 border-t-2 border-dashed border-blue-300 pt-4">
                    <h3 className="text-sm font-semibold text-blue-600 mb-3">المنتجات المراد إضافتها ({itemsToAdd.length})</h3>
                    <div className="space-y-2">
                      {itemsToAdd.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-gray-900">{item.product.name}</span>
                            <span className="text-sm text-gray-600">الكمية: {item.quantity}</span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.purchase_type === 'طرد' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {item.purchase_type}
                            </span>
                            <span className="text-sm font-bold text-primary font-mono">{((item.purchase_type === 'طرد'
                              ? (item.product.wholesale_price || item.product.price || 0)
                              : (item.product.retail_price || item.product.price || 0)) * item.quantity).toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => {
                              const newItems = [...itemsToAdd];
                              newItems.splice(index, 1);
                              setItemsToAdd(newItems);
                            }}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            إزالة
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 p-6 rounded-b-lg border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">المبلغ الإجمالي:</span>
                  <span className="text-2xl font-bold text-primary font-mono">
                    {(order.total_syp || order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات العميل</h2>
              <div className="space-y-3">
                {user ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                      <p className="text-gray-900">{user.name || "-"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم المحل</label>
                      <p className="text-gray-900">{user.shop_name || "-"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                      <p className="text-gray-900">{user.phone || "-"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                      <p className="text-gray-900">{user.address || "-"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                      <p className="text-gray-900">{user.zone || "-"}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم المستخدم</label>
                    <p className="text-gray-900">{order.user_id || "-"}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">رسالة تأكيد العميل</h2>
              {status === 'completed' ? (
                <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg border-2 border-green-300">
                  تم استلام الطلب بنجاح
                </div>
              ) : status === 'error' ? (
                <div className="px-3 py-2 bg-red-100 text-red-800 rounded-lg border-2 border-red-300">
                  {order.problem || 'حدث خطأ في الطلب'}
                </div>
              ) : ""}
            </div>
            {order.warehouse && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">الموظف</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                    <p className="text-gray-900">{order.warehouse.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                    <p className="text-gray-900">{order.warehouse.phone || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Search Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>

            <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-right align-middle transition-all transform bg-white rounded-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">اختر منتج</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">اسم المنتج</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">سعر القطعة</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">سعر الطرد</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">الكمية</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productSuggestions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg">لا يوجد منتجات مطابقة</p>
                        </td>
                      </tr>
                    ) : (
                      productSuggestions.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() => handleSelectProductFromModal(product)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{product.name}</div>
                            {product.ameen_code && (
                              <div className="text-xs text-gray-500 mt-1">{product.ameen_code}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-sm font-bold">
                              {product.retail_price?.toLocaleString() || product.price?.toLocaleString() || '0'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-sm font-bold">
                              {product.wholesale_price?.toLocaleString() || product.price?.toLocaleString() || '0'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold
                              ${product.quantity !== undefined && product.quantity < 10
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                              }`}>
                              {product.quantity !== undefined ? product.quantity : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                              إضافة
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
