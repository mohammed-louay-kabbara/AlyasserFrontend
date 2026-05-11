import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminProducts } from "../../api/products.api";

const InventoryChart: React.FC = () => {
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ["admin-products-analytics"],
    queryFn: () => getAdminProducts({ per_page: 1000 }) // Get all products for analytics
  });

  const inventoryStatus = React.useMemo(() => {
    // Handle admin API response structure
    const productsData = productsResponse?.data?.products?.data || 
                       productsResponse?.data?.data || 
                       productsResponse?.data || 
                       [];

    const status = {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0
    };

    productsData.forEach((product: any) => {
      const quantity = product.quantity || 0;
      const price = product.price_piece || product.price_carton || 0;
      
      status.totalValue += quantity * price;
      
      if (quantity === 0) {
        status.outOfStock++;
      } else if (quantity < 5) {
        status.lowStock++;
      } else {
        status.inStock++;
      }
    });

    return status;
  }, [productsResponse]);

  const totalProducts = inventoryStatus.inStock + inventoryStatus.lowStock + inventoryStatus.outOfStock;
  const inventoryHealth = totalProducts > 0 ? (inventoryStatus.inStock / totalProducts) * 100 : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

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
        <h3 className="text-lg font-semibold text-gray-900">حالة المخزون</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(inventoryHealth)}`}>
          {inventoryHealth.toFixed(1)}% سليم
        </div>
      </div>

      {/* Circular Progress Indicator */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={inventoryHealth >= 80 ? "#10b981" : inventoryHealth >= 60 ? "#f59e0b" : "#ef4444"}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - inventoryHealth / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {inventoryHealth.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">صحة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">متوفر</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {inventoryStatus.inStock} ({totalProducts > 0 ? ((inventoryStatus.inStock / totalProducts) * 100).toFixed(1) : 0}%)
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">مخزون منخفض</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {inventoryStatus.lowStock} ({totalProducts > 0 ? ((inventoryStatus.lowStock / totalProducts) * 100).toFixed(1) : 0}%)
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">منتهي المخزون</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {inventoryStatus.outOfStock} ({totalProducts > 0 ? ((inventoryStatus.outOfStock / totalProducts) * 100).toFixed(1) : 0}%)
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">إجمالي قيمة المخزون</span>
          <span className="text-lg font-bold text-gray-900">
            {inventoryStatus.totalValue.toLocaleString('en-US')} ل.س
          </span>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>رؤية:</strong> 
          {inventoryHealth >= 80 
            ? " المخزون في حالة ممتازة مع مستويات كافية من المخزون."
            : inventoryHealth >= 60
            ? " المخزون يحتاج إلى اهتمام - بعض المنتجات تعاني من انخفاض في المخزون."
            : " تم اكتشاف مشاكل حرجة في المخزون - إعادة التخزين الفوري مطلوبة."
          }
        </div>
      </div>
    </div>
  );
};

export default InventoryChart;
