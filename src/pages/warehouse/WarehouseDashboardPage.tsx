import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWarehouseUserOrders, updateOrderStatus } from "../../api/orders.api";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import PrintOrderModal from "../../components/modals/PrintOrderModal";
import DataTable from "../../components/ui/DataTable";

interface Order {
  id: number;
  user: { name: string; phone: string; address: string };
  status: string;
  total_amount: number;
  created_at: string;
  items: Array<{
    product: { name: string };
    quantity: number;
    price: number;
  }>;
}

const WarehouseDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    // const isWarehouse = user?.role == 3;
    // if (!isWarehouse) {
    //   navigate("/");
    //   return;
    // }
    fetchOrders();
  }, [user, navigate]);

  useEffect(() => {
    let filtered = orders;
    
    if (search) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(search) ||
          order.user?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [search, statusFilter, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getWarehouseUserOrders();
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("فشل في جلب الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReady = async (orderId: number) => {
    try {
      await updateOrderStatus(orderId, "ready");
      toast.success("تم تحديث حالة الطلب إلى جاهز");
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("فشل في تحديث حالة الطلب");
    }
  };

  const handlePrint = (order: Order) => {
    setSelectedOrder(order);
    setShowPrintModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SYP",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      delivered: "bg-green-800 text-white",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "قيد الانتظار",
      processing: "قيد المعالجة",
      ready: "جاهز",
      delivered: "تم التوصيل",
      cancelled: "ملغي",
    };
    return statusMap[status] || status;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="البحث برقم الطلب أو اسم العميل"
            value={search}
            onChange={setSearch}
            className="w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="processing">قيد المعالجة</option>
            <option value="ready">جاهز</option>
            <option value="delivered">تم التوصيل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <p className="text-gray-600">مرحباً، {user?.name}</p>
      </div>

      <DataTable
        data={filteredOrders}
        loading={loading}
        columns={[
          {
            key: "id",
            label: "رقم الطلب",
            sortable: true,
            render: (value: any) => `#${value}`
          },
          {
            key: "user",
            label: "العميل",
            sortable: false,
            render: (value: any) => (
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {value?.name || "-"}
                </div>
                <div className="text-sm text-gray-500">
                  {value?.phone || "-"}
                </div>
              </div>
            )
          },
          {
            key: "created_at",
            label: "التاريخ",
            sortable: true,
            render: (value: any) => new Date(value).toLocaleDateString("en-US")
          },
          {
            key: "total_amount",
            label: "المبلغ الإجمالي",
            sortable: true,
            render: (value: any) => formatCurrency(value)
          },
          {
            key: "status",
            label: "الحالة",
            sortable: true,
            render: (value: any) => (
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                  value
                )}`}
              >
                {getStatusLabel(value)}
              </span>
            )
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
                    handlePrint(row);
                  }}
                >
                  طباعة
                </Button>
                {row.status !== "ready" && row.status !== "delivered" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      handleMarkAsReady(row.id);
                    }}
                  >
                    جاهز
                  </Button>
                )}
              </div>
            )
          }
        ]}
        serverSide={false}
        searchable={false}
        emptyMessage="لا توجد طلبات"
      />

      {showPrintModal && selectedOrder && (
        <PrintOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default WarehouseDashboardPage;
