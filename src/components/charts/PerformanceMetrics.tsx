// import React from "react";

// interface DashboardStats {
//   users_count: number;
//   activated: number;
//   category: number;
//   Product_count: number;
//   Product_quantity: number;
//   Order_pending: number;
//   Order_processing: number;
//   Offers_count: number;
//   Offers: any[];
//   top_products: any[];
//   exchange_rates: any[];
// }

// interface PerformanceMetricsProps {
//   stats: DashboardStats | null;
// }

// const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ stats }) => {
//   const metrics = React.useMemo(() => {
//     if (!stats) {
//       return {
//         userStats: { total: 0, active: 0, pending: 0 },
//         orderStats: { total: 0, pending: 0, processing: 0, completed: 0 },
//         productStats: { total: 0, lowStock: 0, outOfStock: 0 },
//         revenueThisWeek: 0,
//         conversionRate: 0,
//         growthRate: 0,
//         averageOrderValue: 0,
//         orderCompletionRate: 0
//       };
//     }

//     const userStats = {
//       total: stats.users_count || 0,
//       active: (stats.users_count || 0) - (stats.activated || 0),
//       pending: stats.activated || 0
//     };

//     const orderStats = {
//       total: (stats.Order_pending || 0) + (stats.Order_processing || 0),
//       pending: stats.Order_pending || 0,
//       processing: stats.Order_processing || 0,
//       completed: 0 // We don't have completed orders data in the API response
//     };

//     const productStats = {
//       total: stats.Product_count || 0,
//       lowStock: Math.floor((stats.Product_count || 0) * 0.1), // Estimate 10% as low stock
//       outOfStock: stats.Product_quantity || 0
//     };

//     // Calculate estimated revenue from top products
//     const estimatedRevenue = stats.top_products?.reduce((sum: number, p: any) => {
//       const productPrice = p.product?.price || 0;
//       const totalSold = p.total_sold || 0;
//       return sum + (productPrice * totalSold);
//     }, 0) || 0;

//     const conversionRate = userStats.total > 0 ? ((orderStats.pending + orderStats.processing) / userStats.total) * 100 : 0;
//     const orderCompletionRate = orderStats.total > 0 ? ((orderStats.processing) / orderStats.total) * 100 : 0;
//     const averageOrderValue = (orderStats.pending + orderStats.processing) > 0 ? estimatedRevenue / (orderStats.pending + orderStats.processing) : 0;

//     return {
//       userStats,
//       orderStats,
//       productStats,
//       revenueThisWeek: estimatedRevenue,
//       conversionRate,
//       growthRate: stats.Offers_count > 0 ? 15 : 5, // Simulated growth based on offers
//       averageOrderValue,
//       orderCompletionRate
//     };
//   }, [stats]);

//   const getMetricColor = (value: number, thresholds: { good: number, warning: number }) => {
//     if (value >= thresholds.good) return "text-green-600";
//     if (value >= thresholds.warning) return "text-yellow-600";
//     return "text-red-600";
//   };

//   const getProgressColor = (percentage: number) => {
//     if (percentage >= 70) return "bg-green-500";
//     if (percentage >= 40) return "bg-yellow-500";
//     return "bg-red-500";
//   };

  
//   return (
//     <div className="bg-white rounded-lg shadow p-5 mb-5">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-semibold text-gray-900">مؤشرات الأداء</h3>
//         <div className="text-xs text-gray-500">آخر تحديث: {new Date().toLocaleTimeString('ar-SY')}</div>
//       </div>


//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         {/* User Engagement */}
//         <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-blue-700">المستخدمين النشطين</span>
//             <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//             </svg>
//           </div>
//           <div className="text-3xl font-bold text-blue-900 mb-1">
//             {metrics.userStats.active}
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-blue-600">من {metrics.userStats.total} إجمالي</span>
//             <span className="text-xs text-blue-600">{metrics.userStats.pending} معلق</span>
//           </div>
//           <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
//             <div 
//               className={`h-full ${getProgressColor((metrics.userStats.active / metrics.userStats.total) * 100)}`}
//               style={{ width: `${metrics.userStats.total > 0 ? (metrics.userStats.active / metrics.userStats.total) * 100 : 0}%` }}
//             />
//           </div>
//         </div>

//         {/* Order Status */}
//         <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-green-700">الطلبات النشطة</span>
//             <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//             </svg>
//           </div>
//           <div className="text-3xl font-bold text-green-900 mb-1">
//             {metrics.orderStats.total}
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-green-600">{metrics.orderStats.pending} معلق</span>
//             <span className="text-xs text-green-600">{metrics.orderStats.processing} قيد المعالجة</span>
//           </div>
//           <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
//             <div 
//               className={`h-full ${getProgressColor(metrics.orderCompletionRate)}`}
//               style={{ width: `${metrics.orderCompletionRate}%` }}
//             />
//           </div>
//         </div>

//         {/* Revenue */}
//         <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-purple-700">الإيرادات المقدرة</span>
//             <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//             </svg>
//           </div>
//           <div className="text-3xl font-bold text-purple-900 mb-1">
//             {metrics.revenueThisWeek.toLocaleString('en-US')}
//           </div>
//           <div className="text-xs text-purple-600"> إجمالي</div>
//           <div className="mt-2 text-xs text-purple-700">
//             متوسط الطلب: {metrics.averageOrderValue.toLocaleString('en-US')} 
//           </div>
//         </div>

//         {/* Inventory Health */}
//         <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-orange-700">صحة المخزون</span>
//             {metrics.productStats.outOfStock > 0 && (
//               <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//               </svg>
//             )}
//           </div>
//           <div className="text-3xl font-bold text-orange-900 mb-1">
//             {metrics.productStats.total}
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-orange-600">{metrics.productStats.outOfStock} نفذ</span>
//             <span className="text-xs text-orange-600">{metrics.productStats.lowStock} منخفض</span>
//           </div>
//           <div className="mt-2 h-2 bg-orange-200 rounded-full overflow-hidden">
//             <div 
//               className={`h-full ${getProgressColor(((metrics.productStats.total - metrics.productStats.outOfStock) / metrics.productStats.total) * 100)}`}
//               style={{ width: `${metrics.productStats.total > 0 ? ((metrics.productStats.total - metrics.productStats.outOfStock) / metrics.productStats.total) * 100 : 0}%` }}
//             />
//           </div>
//         </div>
//       </div>


//       <div className="space-y-4 mb-6">
//         <div className="p-4 bg-gray-50 rounded-lg">
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm font-medium text-gray-700">معدل التحويل</span>
//             <span className={`font-bold ${getMetricColor(metrics.conversionRate, { good: 20, warning: 10 })}`}>
//               {metrics.conversionRate.toFixed(1)}%
//             </span>
//           </div>
//           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//             <div 
//               className={`h-full ${getProgressColor(metrics.conversionRate)}`}
//               style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
//             />
//           </div>
//           <div className="text-xs text-gray-500 mt-1">طلبات مكتملة لكل مستخدم</div>
//         </div>

//         <div className="p-4 bg-gray-50 rounded-lg">
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm font-medium text-gray-700">معدل المعالجة</span>
//             <span className={`font-bold ${getMetricColor(metrics.orderCompletionRate, { good: 80, warning: 50 })}`}>
//               {metrics.orderCompletionRate.toFixed(1)}%
//             </span>
//           </div>
//           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//             <div 
//               className={`h-full ${getProgressColor(metrics.orderCompletionRate)}`}
//               style={{ width: `${metrics.orderCompletionRate}%` }}
//             />
//           </div>
//           <div className="text-xs text-gray-500 mt-1">نسبة الطلبات قيد المعالجة من الإجمالي</div>
//         </div>

//         <div className="p-4 bg-gray-50 rounded-lg">
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm font-medium text-gray-700">معدل النمو</span>
//             <span className={`font-bold ${getMetricColor(metrics.growthRate, { good: 15, warning: 5 })}`}>
//               {metrics.growthRate.toFixed(1)}%
//             </span>
//           </div>
//           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//             <div 
//               className={`h-full ${getProgressColor(metrics.growthRate)}`}
//               style={{ width: `${Math.min(metrics.growthRate, 100)}%` }}
//             />
//           </div>
//           <div className="text-xs text-gray-500 mt-1">مؤشر نمو الأعمال</div>
//         </div>
//       </div>


//       <div className="space-y-3">
//         {metrics.userStats.pending > 3 && (
//           <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//             <div className="flex items-start gap-3">
//               <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <div className="text-sm text-blue-800">
//                 <strong>إجراء مطلوب:</strong> {metrics.userStats.pending} مستخدمين بانتظار التفعيل. قم بمراجعة طلبات التسجيل لتحسين معدل التحويل.
//               </div>
//             </div>
//           </div>
//         )}

//         {metrics.orderStats.pending > 5 && (
//           <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
//             <div className="flex items-start gap-3">
//               <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <div className="text-sm text-yellow-800">
//                 <strong>تنبيه:</strong> {metrics.orderStats.pending} طلب معلق. قم بمعالجتها لتجنب تأخير التسليم.
//               </div>
//             </div>
//           </div>
//         )}

//         {metrics.productStats.outOfStock > 0 && (
//           <div className="p-4 bg-red-50 rounded-lg border border-red-200">
//             <div className="flex items-start gap-3">
//               <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//               </svg>
//               <div className="text-sm text-red-800">
//                 <strong>حرج:</strong> {metrics.productStats.outOfStock} منتجات نفذت من المخزون. إعادة التخزين الفوري مطلوبة.
//               </div>
//             </div>
//           </div>
//         )}

//         {metrics.revenueThisWeek > 0 && metrics.orderCompletionRate > 70 && (
//           <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//             <div className="flex items-start gap-3">
//               <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <div className="text-sm text-green-800">
//                 <strong>أداء ممتاز:</strong> الإيرادات المقدرة {metrics.revenueThisWeek.toLocaleString('ar-SY')} ل.س مع معدل إكمال {metrics.orderCompletionRate.toFixed(1)}%. استمر في العمل الجيد!
//               </div>
//             </div>
//           </div>
//         )}

//         {metrics.userStats.pending <= 3 && metrics.orderStats.pending <= 5 && metrics.productStats.outOfStock === 0 && (
//           <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//             <div className="flex items-start gap-3">
//               <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <div className="text-sm text-gray-700">
//                 <strong>الحالة:</strong> جميع العمليات تسير بشكل طبيعي. لا توجد إجراءات عاجلة مطلوبة.
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PerformanceMetrics;
