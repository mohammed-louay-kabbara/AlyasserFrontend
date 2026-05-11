import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWarehouseOrders, updateOrderStatus, printOrders } from "../../api/orders.api";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import DataTable from "../../components/ui/DataTable";

export default function WarehouseOrdersPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [warehouseName, setWarehouseName] = useState("");
    const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<any>(null);
  const [selectedOrdersForBulk, setSelectedOrdersForBulk] = useState<number[]>([]);

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseOrders();
    }
  }, [warehouseId]);

  const fetchWarehouseOrders = async () => {
    setLoading(true);
    try {
      const response = await getWarehouseOrders(Number(warehouseId));
      setOrders(response.data || []);
      // Try to get warehouse name from the first order if available
      if (response.data?.length > 0 && response.data[0].warehouse) {
        setWarehouseName(response.data[0].warehouse.name);
      }
    } catch (error) {
      console.error("Error fetching warehouse orders:", error);
      toast.error("فشل في جلب طلبات المستودع");
    } finally {
      setLoading(false);
    }
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
      approved: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "معلق",
      approved: "موافق عليه",
      processing: "قيد المعالجة",
      delivered: "تم التسليم",
      rejected: "مرفوض",
    };
    return statusMap[status] || status;
  };

  const handleStatusChange = async (newStatus: string) => {
    if (selectedOrderForStatus) {
      try {
        await updateOrderStatus(selectedOrderForStatus.id, newStatus);
        toast.success("تم تحديث حالة الطلب بنجاح");
        setShowStatusModal(false);
        setSelectedOrderForStatus(null);
        fetchWarehouseOrders();
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("فشل في تحديث حالة الطلب");
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOrdersForBulk.length === 0) {
      toast.error("يرجى تحديد طلب واحد على الأقل");
      return;
    }
    try {
      for (const orderId of selectedOrdersForBulk) {
        await updateOrderStatus(orderId, newStatus);
      }
      toast.success(`تم تحديث حالة ${selectedOrdersForBulk.length} طلب بنجاح`);
      setSelectedOrdersForBulk([]);
      fetchWarehouseOrders();
    } catch (error) {
      console.error("Error updating bulk order status:", error);
      toast.error("فشل في تحديث حالة الطلبات");
    }
  };

  const handlePrint = async (orderId?: number) => {
    try {
      const ids = orderId ? orderId.toString() : selectedOrdersForBulk.join(",");
      console.log('Printing orders with IDs:', ids);
      const response = await printOrders(ids);
      console.log('Print response:', response);
      
      // Handle different response types
      let blob: Blob;
      if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], { type: 'application/pdf' });
      } else {
        // Fallback for other response types
        blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${ids}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("تم تحميل الفاتورة بنجاح");
    } catch (error: any) {
      console.error("Error printing orders:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "فشل في تحميل الفاتورة");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrdersForBulk(orders.map((o) => o.id));
    } else {
      setSelectedOrdersForBulk([]);
    }
  };

  const handleSelectOrder = (orderId: number, checked: boolean) => {
    if (checked) {
      setSelectedOrdersForBulk([...selectedOrdersForBulk, orderId]);
    } else {
      setSelectedOrdersForBulk(selectedOrdersForBulk.filter((id) => id !== orderId));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <p className="text-gray-600">{warehouseName || `المستودع #${warehouseId}`}</p>
          <span className="text-sm text-gray-500">
            جميع الطلبات ({orders.length})
          </span>
          <span className="text-sm text-gray-500">
            {selectedOrdersForBulk.length > 0 && `${selectedOrdersForBulk.length} طلب محدد`}
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/warehouses")} variant="outline">
            العودة للمستودعات
          </Button>
          <Button
            onClick={fetchWarehouseOrders}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
          {selectedOrdersForBulk.length > 0 && (
            <>
              <Button onClick={() => handlePrint()} className="bg-purple-600 text-white">
                طباعة الفواتير المحددة
              </Button>
              <Button onClick={() => handleBulkStatusChange("processing")} className="bg-blue-600 text-white">
                تحديد للمعالجة
              </Button>
              <Button onClick={() => handleBulkStatusChange("delivered")} className="bg-green-600 text-white">
                تسليم الكل
              </Button>
            </>
          )}
        </div>
      </div>

      <DataTable
        data={orders}
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
            render: (value: any) => new Date(value).toLocaleDateString("en-US", { timeZone: "UTC" })
          },
          {
            key: "total_syp",
            label: "المبلغ الإجمالي",
            sortable: true,
            render: (value: any, row: any) => formatCurrency(value || row.total_amount || 0)
          },
          {
            key: "status",
            label: "الحالة",
            sortable: true,
            render: (value: any, row: any) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrderForStatus(row);
                  setShowStatusModal(true);
                }}
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)} hover:opacity-80 cursor-pointer`}
              >
                {getStatusLabel(value)}
              </button>
            )
          },
          {
            key: "items",
            label: "عدد العناصر",
            sortable: true,
            render: (value: any) => value?.length || 0
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
                  onClick={() => navigate(`/orders/${row.id}`)}
                >
                  التفاصيل
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePrint(row.id)}
                >
                  طباعة
                </Button>
              </div>
            )
          }
        ]}
        serverSide={false}
        searchable={false}
        selectable={true}
        selectedRows={new Set(selectedOrdersForBulk)}
        onRowSelect={(orderId, selected) => handleSelectOrder(orderId as number, selected)}
        onSelectAll={handleSelectAll}
        emptyMessage="لا توجد طلبات لهذا المستودع"
      />

      {/* Status Change Modal */}
      {showStatusModal && selectedOrderForStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">تغيير حالة الطلب</h2>
            <p className="text-sm text-gray-600 mb-4">
              طلب #{selectedOrderForStatus.id} - {selectedOrderForStatus.user?.name}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleStatusChange("pending")}
                className={`w-full px-4 py-3 rounded-lg border-2 text-right ${
                  selectedOrderForStatus.status === "pending"
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-300 hover:border-yellow-400'
                }`}
              >
                <div className="font-medium">معلق</div>
              </button>
              <button
                onClick={() => handleStatusChange("approved")}
                className={`w-full px-4 py-3 rounded-lg border-2 text-right ${
                  selectedOrderForStatus.status === "approved"
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="font-medium">موافق عليه</div>
              </button>
              <button
                onClick={() => handleStatusChange("processing")}
                className={`w-full px-4 py-3 rounded-lg border-2 text-right ${
                  selectedOrderForStatus.status === "processing"
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <div className="font-medium">قيد المعالجة</div>
              </button>
              <button
                onClick={() => handleStatusChange("delivered")}
                className={`w-full px-4 py-3 rounded-lg border-2 text-right ${
                  selectedOrderForStatus.status === "delivered"
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <div className="font-medium">تم التسليم</div>
              </button>
              <button
                onClick={() => handleStatusChange("rejected")}
                className={`w-full px-4 py-3 rounded-lg border-2 text-right ${
                  selectedOrderForStatus.status === "rejected"
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-red-400'
                }`}
              >
                <div className="font-medium">مرفوض</div>
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrderForStatus(null);
                }}
                variant="outline"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
