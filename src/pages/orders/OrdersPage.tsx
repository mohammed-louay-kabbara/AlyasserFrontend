import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminOrders, deleteAdminOrder, getUserOrders, exportOrderToAmeenTxt, markAsReady } from "../../api/orders.api";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { getStatusBadge, getStatusLabel, getErrorDetails } from "../../utils/dataTableUtils";
import { CanAccess } from "../../components/auth/CanAccess";

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [areas, setAreas] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, dateFilter, areaFilter, userId, currentPage, rowsPerPage, deliveryTypeFilter]);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await api.get("/admin/users-list");
      const usersData = Array.isArray(response.data) ? response.data : [];
      const uniqueZones = Array.from(new Set(
        usersData
          .map((user: any) => user.zone)
          .filter((zone: string) => zone)
      ));
      setAreas(uniqueZones as string[]);
    } catch (error: any) {
      console.error("Error fetching zones:", error);
      const errorMessage = error.response?.data?.message || error.message || "فشل في جلب المناطق";
      toast.error(errorMessage);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let response;

      if (userId) {
        response = await getUserOrders(Number(userId), currentPage, rowsPerPage);
        console.log('User orders response:', response.data);
        const ordersData = response.data?.data || response.data || [];
        setOrders(ordersData);
        setTotalPages(response.data?.last_page || 1);
        setTotalOrders(response.data?.total || 0);
      } else {
        response = await getAdminOrders({
          search: search || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          date: dateFilter || undefined,
          area: areaFilter !== "all" ? areaFilter : undefined,
          delivery_type: deliveryTypeFilter !== "all" ? deliveryTypeFilter : undefined,
          page: currentPage,
          per_page: rowsPerPage
        });
        const ordersData = response.data.orders?.data || response.data.orders || [];
        setOrders(ordersData);
        setTotalPages(response.data.orders?.last_page || 1);
        setTotalOrders(response.data.orders?.total || 0);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || error.message || "فشل في جلب الطلبات";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    setConfirmMessage("هل أنت متأكد من حذف هذا الطلب؟");
    pendingActionRef.current = async () => {
      try {
        await deleteAdminOrder(orderId);
        toast.success("تم حذف الطلب بنجاح");
        fetchOrders();
      } catch (error: any) {
        console.error("Error deleting order:", error);
        console.error("Error response:", error.response);
        const errorMessage = error.response?.data?.message || error.message || "فشل في حذف الطلب";
        toast.error(errorMessage);
      }
    };
    setShowConfirmModal(true);
  };

  const handleMarkAsReady = (orderId: number) => {
    setConfirmMessage("هل أنت متأكد من تحديد هذا الطلب كجاهز؟");
    pendingActionRef.current = async () => {
      try {
        await markAsReady(orderId);
        toast.success("تم تحديد الطلب كجاهز بنجاح");
        fetchOrders();
      } catch (error: any) {
        console.error("Error marking order as ready:", error);
        console.error("Error response:", error.response);
        const errorMessage = error.response?.data?.message || error.message || "فشل في تحديد الطلب كجاهز";
        toast.error(errorMessage);
      }
    };
    setShowConfirmModal(true);
  };

  const handleExportToAmeen = async (orderId: number) => {
    try {
      const response = await exportOrderToAmeenTxt(orderId);
      const blob = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Order_${orderId}_Ameen_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير الطلب بنجاح");
    } catch (error: any) {
      console.error("Error exporting order to Ameen:", error);
      const errorMessage = error.response?.data?.error || error.message || "فشل في تصدير الطلب";
      toast.error(errorMessage);
    }
  };

  const handleViewDetails = (order: any) => {
    navigate(`/orders/${order.order_number || order.id}`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="البحث باسم المستخدم أو رقم الطلب"
            value={search}
            onChange={setSearch}
            className="w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">معلق</option>
            <option value="confirmed">موافق عليه</option>
            <option value="processing">قيد المعالجة</option>
            <option value="delivered">تم التسليم</option>
            <option value="completed">تم التوصيل</option>
            <option value="error">مشكلة</option>
          </select>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">جميع المناطق</option>
            {areas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-48"
          />
        </div>
        <div className="flex gap-2">
          {userId && (
            <button
              onClick={() => navigate("/orders")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← العودة لجميع الطلبات
            </button>
          )}
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
          <div className="flex gap-4">
            {hasPermission("view_warehouse_orders") && !hasPermission("view_orders") ? (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="delivery"
                  checked={deliveryTypeFilter == "delivery"}
                  onChange={(e) => setDeliveryTypeFilter(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span>المستودع</span>
              </label>
            ) : (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="all"
                    checked={deliveryTypeFilter == "all"}
                    onChange={(e) => setDeliveryTypeFilter(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>الكل</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="delivery"
                    checked={deliveryTypeFilter == "delivery"}
                    onChange={(e) => setDeliveryTypeFilter(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>المستودع</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="pickup"
                    checked={deliveryTypeFilter == "pickup"}
                    onChange={(e) => setDeliveryTypeFilter(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>المركز</span>
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      <DataTableWrapper
        data={orders}
        loading={loading}
        columns={[
          {
            key: "order_number",
            label: "رقم الطلب",
            sortable: true,
            render: (value: any) => value || "-"
          },
          {
            key: "delivery_type",
            label: "نوع التوصيل",
            sortable: true,
            render: (value: any) => {
              if (value === "pickup") return "مركز";
              if (value === "delivery") return "توصيل";
              return value || "-";
            }
          },
          {
            key: "user",
            label: "العميل",
            sortable: false,
            render: (value: any) => (
              <div>
                <div className="text-sm font-medium text-gray-900">{value?.name || "-"}</div>
                <div className="text-sm text-gray-500">{value?.phone || "-"}</div>
              </div>
            )
          },
          {
            key: "total_amount",
            label: "المبلغ الإجمالي",
            sortable: true,
            render: (value: any) => (
              <div className="text-sm font-medium text-gray-900">
                {value}
              </div>
            )
          },
          {
            key: "status",
            label: "الحالة",
            sortable: true,
            render: (value: any, row: any) => {
              const errorDetails = getErrorDetails(row);
              return (
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>
                    {getStatusLabel(value)}
                  </span>
                  {errorDetails && (
                    <div className="mt-1 text-xs text-red-600 max-w-xs truncate" title={errorDetails}>
                      {errorDetails}
                    </div>
                  )}
                </div>
              );
            }
          },
          {
            key: "created_at",
            label: "التاريخ",
            sortable: true,
            render: (value: any) => new Date(value).toLocaleDateString("en-US")
          },
          {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_: any, row: any) => (
              <div className="flex space-x-reverse space-x-2">
                <CanAccess permission="view_orders">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(row)}
                  >
                    عرض التفاصيل
                  </Button>
                </CanAccess>
                <CanAccess permission="view_orders">
                  <Button
                    size="sm"
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                    onClick={() => handleExportToAmeen(row.id)}
                  >
                    {/* <span>📥</span> */}
                    فاتورة الأمين
                  </Button>
                </CanAccess>
                {!userId && (
                  hasPermission("view_warehouse_orders") && !hasPermission("view_orders") ? (
                    <CanAccess permission="manage_orders">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleMarkAsReady(row.id)}
                      >
                        جاهز
                      </Button>
                    </CanAccess>
                  ) : (
                    <CanAccess permission="delete_orders">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteOrder(row.id)}
                      >
                        حذف
                      </Button>
                    </CanAccess>
                  )
                )}
              </div>
            )
          }
        ]}
        serverSide={true}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalOrders}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value: number) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
        rowsPerPage={rowsPerPage}
        searchable={false}
        selectable={false}
        emptyMessage="لا توجد طلبات"
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
        type="danger"
      />
    </div>
  );
};

export default OrdersPage;
