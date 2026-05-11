import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
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

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/app">
        <Toaster position="top-center" toastOptions={{ style: { fontFamily: "Tajawal" } }} />
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
