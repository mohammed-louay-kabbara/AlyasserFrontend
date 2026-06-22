import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select, { MultiValue } from "react-select";
import { getAdminOrders, deleteAdminOrder, getUserOrders, getUserOrdersByUserNumber, exportOrderToAmeenTxt, markAsReady } from "../../api/orders.api";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ActionDropdown, { ActionItem } from "../../components/ui/ActionDropdown";
import { getStatusBadge, getStatusLabel, getErrorDetails } from "../../utils/dataTableUtils";

interface AreaOption {
  value: string;
  label: string;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { userNumber } = useParams<{ userNumber?: string }>();
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
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
  const [exporting, setExporting] = useState(false);
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);

  const areaOptions = useMemo<AreaOption[]>(() => {
    return areas.map((area) => ({ value: area, label: area }));
  }, [areas]);

  const selectedAreaOptions = useMemo<AreaOption[]>(() => {
    return areaOptions.filter((option) => areaFilter.includes(option.value));
  }, [areaOptions, areaFilter]);

  const handleAreaChange = (selectedOptions: MultiValue<AreaOption>) => {
    setAreaFilter(selectedOptions ? selectedOptions.map((option) => option.value) : []);
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, dateFilter, areaFilter, userNumber, currentPage, rowsPerPage, deliveryTypeFilter]);

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

      if (userNumber) {
        const isNumericId = /^[0-9]+$/.test(userNumber);
        response = isNumericId
          ? await getUserOrders(Number(userNumber), currentPage, rowsPerPage)
          : await getUserOrdersByUserNumber(userNumber, currentPage, rowsPerPage);
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
          area: areaFilter.length > 0 ? areaFilter.join(',') : undefined,
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

  const handleExportToAmeen = async (order: any) => {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleViewDetails = (order: any) => {
    navigate(`/orders/${order.order_number || order.id}`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            placeholder={userNumber ? "البحث بواسطة رقم الطلب" : " اسم الزبون أو رقم الطلب"}
            value={search}
            onChange={setSearch}
            className="w-64 placeholder:text-sm"
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
          {!userNumber && (
            <div className="w-24 min-w-[260px] max-w-sm">
              <Select<AreaOption, true>
                isMulti
                isSearchable
                isClearable
                closeMenuOnSelect={false}
                options={areaOptions}
                value={selectedAreaOptions}
                onChange={handleAreaChange}
                placeholder="ابحث أو اختر المنطقة"
                noOptionsMessage={() => "لا توجد مناطق"}
                classNamePrefix="area-select"
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderRadius: "0.5rem",
                    borderColor: "#d1d5db",
                    boxShadow: "none",
                    paddingLeft: "0.25rem",
                    paddingRight: "0.25rem",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    '&:hover': {
                      borderColor: "#9ca3af"
                    }
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    zIndex: 50
                  }),
                  multiValue: (base) => ({
                    ...base,
                    borderRadius: "9999px",
                    backgroundColor: "rgba(79, 70, 229, 0.12)",
                    color: "#4f46e5"
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#4f46e5",
                    fontWeight: 600
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#4f46e5",
                    ':hover': {
                      backgroundColor: "rgba(79, 70, 229, 0.2)",
                      color: "#4f46e5"
                    }
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#9ca3af"
                  })
                }}
              />
            </div>
          )}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-48"
          />
          <button type="submit" className="sr-only">بحث</button>
        </form>
        <div className="flex gap-2">
          {userNumber && (
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
          // {
          //   key: "user",
          //   label: "العميل",
          //   sortable: false,
          //   render: (value: any) => (
          //     <div>
          //       <div className="text-sm font-medium text-gray-900">{value?.name || "-"}</div>
          //       <div className="text-sm text-gray-500">{value?.phone || "-"}</div>
          //     </div>
          //   )
          // },
          {
            key: "shop_name",
            label: "اسم المحل",
            sortable: false,
            render: (_value: any, row: any) => (
              <div className="text-sm text-gray-900">{row.user?.shop_name || "-"}</div>
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
            key: "warehouse.name",
            label: "اسم الموظف",
            sortable: true,
            render: (_value: any, row: any) => (
              <div className="text-sm text-gray-900">{row?.warehouse?.name || "-"}</div>
            )
          },
          {
            key: "export_date",
            label: "تاريخ تحميل الفاتورة",
            sortable: true,
            render: (_value: any, row: any) => (
              <div className="text-sm text-gray-900">
                {row?.export_date ? new Date(row.export_date).toLocaleString("ar-SA", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                }) : "-"}
              </div>
            )
          },
          {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_: any, row: any) => {
              const actions: ActionItem[] = [];

              // View Details action
              if (hasPermission("view_orders")) {
                actions.push({
                  label: "عرض التفاصيل",
                  onClick: () => handleViewDetails(row),
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )
                });
              }

              // Export to Ameen action
              if (hasPermission("view_orders")) {
                actions.push({
                  label: "فاتورة الأمين",
                  onClick: () => handleExportToAmeen(row),
                  disabled: exporting,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )
                });
              }

              // Ready or Delete action (conditional)
              if (!userNumber) {
                if (hasPermission("view_warehouse_orders") && !hasPermission("view_orders")) {
                  if (hasPermission("manage_orders")) {
                    actions.push({
                      label: "جاهز",
                      onClick: () => handleMarkAsReady(row.id),
                      icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )
                    });
                  }
                } else {
                  if (hasPermission("delete_orders")) {
                    actions.push({
                      label: "حذف",
                      onClick: () => handleDeleteOrder(row.id),
                      danger: true,
                      icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )
                    });
                  }
                }
              }

              return <ActionDropdown actions={actions} align="left" size="sm" />;
            }
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
