import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminOrderDetail, getOrderDetail, updateOrderStatus } from "../../api/orders.api";
import { getAdminUsers } from "../../api/users.api";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import OrderBill from "../../components/print/OrderBill";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const printRef = React.useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const [showPrintView, setShowPrintView] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);

      // Try admin endpoint first
      let response;
      try {
        response = await getAdminOrderDetail(Number(id));
        console.log('Admin order detail response:', response);
      } catch (adminError: any) {
        console.log('Admin endpoint failed, trying public endpoint:', adminError);
        // Fallback to public endpoint
        response = await getOrderDetail(Number(id));
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

      console.log('Extracted order data:', orderData);

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



  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      await updateOrderStatus(Number(id), newStatus);
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

  return (
    <div>
      {showPrintView ? (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 no-print">
          <Button onClick={() => setShowPrintView(false)} variant="outline">
            العودة
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 text-white">
            طباعة
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-gray-600">
            {new Date(order.created_at).toLocaleDateString("en-US")}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              العودة
            </Button>
            <Button onClick={() => setShowPrintView(true)} className="bg-blue-600 text-white">
              طباعة
            </Button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الطلب المخصص</label>
                  <p className="text-lg font-bold text-gray-900">{order.order_number || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع التوصيل</label>
                  <p className="text-lg font-medium text-gray-900">{order.delivery_type == "delivery" ? "توصيل" : "مركز" }</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  {status === 'completed' ? (
                    <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg border-2 border-green-300">
                      تم استلام الطلب بنجاح
                    </div>
                  ) : status === 'error' ? (
                    <div className="px-3 py-2 bg-red-100 text-red-800 rounded-lg border-2 border-red-300">
                      {order.problem || 'حدث خطأ في الطلب'}
                    </div>
                  ) : (
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        handleStatusChange(e.target.value);
                      }}
                      className={`px-3 py-1 text-sm font-semibold rounded-lg border-2 ${getStatusBadge(status)} focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="pending">معلق</option>
                      <option value="confirmed">موافق عليه</option>
                      <option value="processing">قيد المعالجة</option>
                      {/* <option value="completed">تم التسليم</option> */}
                      {/* <option value="completed">مكتمل</option>
                    <option value="error">خطأ</option> */}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString("en-US")}
                  </p>
                </div>
              </div>

  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                  <p className="text-gray-900">{order.notes || "-"}</p>
                </div>
              
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">عناصر الطلب</h2>
              <div className="space-y-3">
                {order.items?.map((item: any, index: number) => {
                  const isOffer = item.purchase_type === 'عرض' || item.offer_id;
                  const name = isOffer
                    ? item.offer?.description || 'عرض'
                    : item.product?.name || 'منتج';
                  const price = item.unit_price || item.price || 0;
                  const quantity = item.quantity || 0;

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        <p className="text-sm text-gray-500">
                          {quantity} × {price}
                          {isOffer && <span className="mr-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">عرض</span>}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {item.sub_total || (quantity * price)}
                      </p>
                    </div>
                  );
                })}
                {(!order.items || order.items.length === 0) && (
                  <p className="text-gray-500 text-center py-4">لا توجد عناصر</p>
                )}
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">المبلغ الإجمالي:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {order.total_syp || order.total_amount}
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
                {order.warehouse_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم المستودع</label>
                    <p className="text-gray-900">{order.warehouse_id}</p>
                  </div>
                )}
              </div>
            </div>

            {order.warehouse && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">المستودع</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                    <p className="text-gray-900">{order.warehouse.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <p className="text-gray-900">{order.warehouse.address || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
