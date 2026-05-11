import React, { useEffect, useState } from "react";
import PerformanceMetrics from "../../components/charts/PerformanceMetrics";
import ExchangeRateManager from "../../components/charts/ExchangeRateManager";
import { getDashboardStats } from "../../api/dashboard.api";

interface DashboardStats {
  users_count: number;
  activated: number;
  category: number;
  Product_count: number;
  Product_quantity: number;
  Order_pending: number;
  Order_processing: number;
  Offers_count: number;
  Offers: any[];
  top_products: any[];
  exchange_rates: any[];
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.users_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">مستخدمين بانتظار التفعيل</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activated || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">المنتجات المتوفرة</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.Product_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3v-4l-3-3m2 5h-3" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">المنتجات على وشك النفاد</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.Product_quantity || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">طلبات معلقة</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.Order_pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-lg">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">طلبات قيد المعالجة</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.Order_processing || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">العروض النشطة</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.Offers_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الأصناف</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.category || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Overview */}
      <PerformanceMetrics stats={stats} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">أكثر المنتجات مبيعاً</h3>
          </div>
          <div className="p-4">
            {stats?.top_products && stats.top_products.length > 0 ? (
              <div className="space-y-4">
                {stats.top_products.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product?.name || 'منتج غير معروف'}</p>
                        <p className="text-xs text-gray-500">تم بيع {item.total_sold} وحدة</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد بيانات</p>
            )}
          </div>
        </div>

        {/* Exchange Rate Manager */}
        <ExchangeRateManager />
      </div>

      {/* Active Offers */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">العروض النشطة</h3>
        </div>
        <div className="p-4">
          {stats?.Offers && stats.Offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.Offers.map((offer: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  {offer.image && (
                    <img 
                      src={`/storage/${offer.image}`} 
                      alt={offer.description} 
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <p className="text-sm font-medium text-gray-900">{offer.description}</p>
                  <p className="text-xs text-gray-500">ينتهي: {new Date(offer.expires_at).toLocaleDateString('ar-EG')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">لا توجد عروض نشطة</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
