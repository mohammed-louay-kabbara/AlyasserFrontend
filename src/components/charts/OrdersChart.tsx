import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrders } from "../../api/orders.api";

const OrdersChart: React.FC = () => {
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ["admin-orders-chart"],
    queryFn: () => getAdminOrders({ per_page: 1000 }) // Get all orders for analytics
  });

  const orderStats = React.useMemo(() => {
    // Handle admin API response structure
    const ordersData = ordersResponse?.data?.orders?.data || 
                       ordersResponse?.data?.data || 
                       ordersResponse?.data || 
                       [];

    const stats = {
      pending: 0,
      approved: 0,
      processing: 0,
      delivered: 0,
      rejected: 0,
      total: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };

    ordersData.forEach((order: any) => {
      const status = order.status || 'pending';
      const amount = order.total_syp || order.total_usd || order.total_amount || 0;
      
      stats.total++;
      stats.totalRevenue += amount;
      
      switch (status) {
        case 'pending':
          stats.pending++;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'processing':
          stats.processing++;
          break;
        case 'delivered':
          stats.delivered++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
      }
    });

    stats.averageOrderValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;

    return stats;
  }, [ordersResponse]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      approved: "bg-blue-500",
      processing: "bg-purple-500",
      delivered: "bg-green-500",
      rejected: "bg-red-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "معلق",
      approved: "موافق عليه",
      processing: "قيد المعالجة",
      delivered: "تم التسليم",
      rejected: "مرفوض"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const completionRate = orderStats.total > 0 ? (orderStats.delivered / orderStats.total) * 100 : 0;

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">جاري تحميل البيانات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">تحليلات الطلبات</h3>
        <div className="text-sm text-gray-500">
          الإجمالي: {orderStats.total} طلب
        </div>
      </div>

      {/* Order Status Bars */}
      <div className="space-y-4 mb-6">
        {Object.entries({
          pending: orderStats.pending,
          approved: orderStats.approved,
          processing: orderStats.processing,
          delivered: orderStats.delivered,
          rejected: orderStats.rejected
        }).map(([status, count]) => (
          <div key={status} className="flex items-center space-x-reverse space-x-4">
            <div className="w-24 text-sm text-gray-600 text-right">
              {getStatusLabel(status)}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div 
                className={`${getStatusColor(status)} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                style={{ width: `${orderStats.total > 0 ? (count / orderStats.total) * 100 : 0}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 mb-1">معدل الإنجاز</div>
          <div className="text-2xl font-bold text-green-900">
            {completionRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">متوسط قيمة الطلب</div>
          <div className="text-2xl font-bold text-blue-900">
            {orderStats.averageOrderValue.toLocaleString('en-US')} ل.س
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">إجمالي الإيرادات</span>
          <span className="text-lg font-bold text-gray-900">
            {orderStats.totalRevenue.toLocaleString('en-US')} ل.س
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">الطلبات المسلمة</span>
          <span className="text-sm font-medium text-green-600">
            {orderStats.delivered} / {orderStats.total}
          </span>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-3 bg-amber-50 rounded-lg">
        <div className="text-sm text-amber-800">
          <strong>رؤية:</strong> 
          {completionRate >= 80 
            ? " معدل إنجاز ممتاز للطلبات! العملاء راضون عن الخدمة."
            : completionRate >= 60
            ? " أداء جيد، ولكن هناك مجال للتحسين في تنفيذ الطلبات."
            : " إنجاز الطلبات يحتاج إلى اهتمام - فكر في مراجعة عملية التنفيذ."
          }
          {orderStats.pending > orderStats.delivered && 
            " عدد كبير من الطلبات المعلقة - فكر في زيادة القدرة على المعالجة."
          }
        </div>
      </div>
    </div>
  );
};

export default OrdersChart;
