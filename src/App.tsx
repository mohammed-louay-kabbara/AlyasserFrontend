import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { useAuthStore } from "./store/authStore";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import UsersPage from "./pages/users/UsersPage";
import UserDetailPage from "./pages/users/UserDetailPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import ProductsPage from "./pages/products/ProductsPage";
import OffersPage from "./pages/offers/OffersPage";
import OrdersPage from "./pages/orders/OrdersPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import WarehousePage from "./pages/warehouse/WarehousePage";
import WarehouseOrdersPage from "./pages/warehouse/WarehouseOrdersPage";
import WarehouseDashboardPage from "./pages/warehouse/WarehouseDashboardPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import UserNotificationsPage from "./pages/notifications/UserNotificationsPage";
import RolesPage from "./pages/roles/RolesPage";
import ProfilePage from "./pages/profile/ProfilePage";
import CategoryProductsPage from "./pages/categories/CategoryProductsPage";
import StaffPage from "./pages/staff/StaffPage";
import UnauthorizedPage from "./pages/error/UnauthorizedPage";
import { PermissionGuard } from "./components/auth/PermissionGuard";
import { updateUserProfile } from "./api/users.api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkSession, logout } = useAuthStore();
  
  // Check session expiration before rendering
  if (isAuthenticated && !checkSession()) {
    logout();
    return <Navigate to="/login" replace />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function ForcePasswordChangeModal() {
  const { needsPasswordChange, clearPasswordChangeFlag, user, isAuthenticated } = useAuthStore();
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Debug: Check if needsPasswordChange is working
  console.log("ForcePasswordChangeModal - needsPasswordChange:", needsPasswordChange);
  console.log("ForcePasswordChangeModal - user:", user);
  console.log("ForcePasswordChangeModal - isAuthenticated:", isAuthenticated);
  console.log("ForcePasswordChangeModal - localStorage:", localStorage.getItem(`force_password_change_${user?.id}`));
  console.log("ForcePasswordChangeModal - auth_user from localStorage:", localStorage.getItem("auth_user"));

  const forcePasswordMutation = useMutation({
    mutationFn: (data: any) => updateUserProfile(data),
    onSuccess: () => {
      clearPasswordChangeFlag();
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      toast.success("تم تغيير كلمة المرور بنجاح");
    },
    onError: () => {
      toast.error("فشل تغيير كلمة المرور");
    },
  });

  const handleForcePasswordChange = () => {
    if (!passwordData.old_password) {
      toast.error("يرجى إدخال كلمة المرور القديمة");
      return;
    }
    if (!passwordData.new_password) {
      toast.error("يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين");
      return;
    }
    
    forcePasswordMutation.mutate(passwordData);
  };

  if (!needsPasswordChange || !isAuthenticated || !user) {
    console.log("Modal not showing - needsPasswordChange:", needsPasswordChange, "isAuthenticated:", isAuthenticated, "user:", user);
    return null;
  }

  console.log("Modal should be showing - needsPasswordChange is true");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">تغيير كلمة المرور الإجباري</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            تم إعادة تعيين كلمة مرورك من قبل الأدمن. يجب عليك تغيير كلمة المرور قبل المتابعة.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور القديمة</label>
            <input
              type="password"
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
              placeholder="أدخل كلمة المرور القديمة"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-reverse space-x-3 mt-6">
          <button
            onClick={handleForcePasswordChange}
            disabled={forcePasswordMutation.isPending}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {forcePasswordMutation.isPending ? "جاري التغيير..." : "تغيير كلمة المرور"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/app">
        <Toaster position="top-center" toastOptions={{ style: { fontFamily: "Tajawal" } }} />
        <ForcePasswordChangeModal />
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="/warehouse-dashboard" element={
            <PermissionGuard permissions={["view_warehouse_orders"]}>
              <WarehouseDashboardPage />
            </PermissionGuard>
          } />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={
              <PermissionGuard permissions={["view_dashboard"]}>
                <DashboardPage />
              </PermissionGuard>
            } />
            <Route path="analytics" element={
              <PermissionGuard permissions={["view_analytics"]}>
                <AnalyticsPage />
              </PermissionGuard>
            } />
            <Route path="users" element={
              <PermissionGuard permissions={["view_users"]}>
                <UsersPage />
              </PermissionGuard>
            } />
            <Route path="users/:id" element={
              <PermissionGuard permissions={["view_users"]}>
                <UserDetailPage />
              </PermissionGuard>
            } />
            <Route path="categories" element={
              <PermissionGuard permissions={["view_categories"]}>
                <CategoriesPage />
              </PermissionGuard>
            } />
            <Route path="categories/:categoryId/products" element={
              <PermissionGuard permissions={["view_categories"]}>
                <CategoryProductsPage />
              </PermissionGuard>
            } />
            <Route path="products" element={
              <PermissionGuard permissions={["view_products"]}>
                <ProductsPage />
              </PermissionGuard>
            } />
            <Route path="offers" element={
              <PermissionGuard permissions={["view_offers"]}>
                <OffersPage />
              </PermissionGuard>
            } />
            <Route path="orders" element={
              <PermissionGuard permissions={["view_orders"]}>
                <OrdersPage />
              </PermissionGuard>
            } />
            <Route path="orders/:id" element={
              <PermissionGuard permissions={["view_orders"]}>
                <OrderDetailPage />
              </PermissionGuard>
            } />
            <Route path="orders/user/:userId" element={
              <PermissionGuard permissions={["view_orders"]}>
                <OrdersPage />
              </PermissionGuard>
            } />
            <Route path="warehouses" element={
              <PermissionGuard permissions={["view_warehouses"]}>
                <WarehousePage />
              </PermissionGuard>
            } />
            <Route path="warehouses/:warehouseId/orders" element={
              <PermissionGuard permissions={["view_warehouse_orders"]}>
                <WarehouseOrdersPage />
              </PermissionGuard>
            } />
            <Route path="notifications" element={
              <PermissionGuard permissions={["view_notifications"]}>
                <NotificationsPage />
              </PermissionGuard>
            } />
            <Route path="notifications/user/:userId" element={
              <PermissionGuard permissions={["view_notifications"]}>
                <UserNotificationsPage />
              </PermissionGuard>
            } />
            <Route path="roles" element={
              <PermissionGuard permissions={["manage_users"]}>
                <RolesPage />
              </PermissionGuard>
            } />
            <Route path="staff" element={
              <PermissionGuard permissions={["view_staff"]}>
                <StaffPage />
              </PermissionGuard>
            } />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            <Route path="warehouse" element={<Navigate to="/warehouses" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
