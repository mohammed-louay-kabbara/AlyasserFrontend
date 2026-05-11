import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrders } from "../../api/orders.api";

const SalesChart: React.FC = () => {
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ["admin-orders-analytics"],
    queryFn: () => getAdminOrders({ per_page: 1000 }) // Get all orders for analytics
  });

  // Process data for monthly sales
  const monthlySales = React.useMemo(() => {
    // Handle admin API response structure
    const ordersData = ordersResponse?.data?.orders?.data || 
                       ordersResponse?.data?.data || 
                       ordersResponse?.data || 
                       [];
    
    if (!Array.isArray(ordersData) || ordersData.length === 0) return [];
    
    const salesByMonth: Record<string, number> = {};
    
    ordersData.forEach((order: any) => {
      try {
        const date = new Date(order.created_at);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        if (!salesByMonth[monthKey]) {
          salesByMonth[monthKey] = 0;
        }
        
        // Use total_syp or total_usd or total_amount
        const amount = order.total_syp || order.total_usd || order.total_amount || 0;
        salesByMonth[monthKey] += amount;
      } catch {
        // Skip invalid dates
      }
    });
    
    return Object.entries(salesByMonth).map(([month, amount]) => ({
      month,
      amount
    }));
  }, [ordersResponse]);

  const totalSales = monthlySales.reduce((sum, item) => sum + item.amount, 0);
  const maxSales = Math.max(...monthlySales.map(item => item.amount), 1);

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
        <h3 className="text-lg font-semibold text-gray-900">نظرة عامة على المبيعات</h3>
        <div className="text-sm text-gray-500">
          الإجمالي: {totalSales.toLocaleString('en-US')} ل.س
        </div>
      </div>
      
      <div className="space-y-4">
        {monthlySales.map((item, index) => (
          <div key={index} className="flex items-center space-x-reverse space-x-4">
            <div className="w-20 text-sm text-gray-600 text-right">
              {item.month}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                style={{ width: `${(item.amount / maxSales) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {item.amount.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {monthlySales.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          لا توجد بيانات مبيعات متاحة
        </div>
      )}
    </div>
  );
};

export default SalesChart;
