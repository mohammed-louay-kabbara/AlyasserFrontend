import { Permission, UserRole } from "../types";

// Default role permissions configuration
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Dashboard
    "view_dashboard",
    "view_analytics",
    // Users
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",
    // Products
    "view_products",
    "edit_products",
    "delete_products",
    // Categories
    "view_categories",
    "create_categories",
    "edit_categories",
    "delete_categories",
    // Offers
    "view_offers",
    "create_offers",
    "edit_offers",
    "delete_offers",
    // Orders
    "view_orders",
    "create_orders",
    "edit_orders",
    "delete_orders",
    "manage_orders",
    "send_to_warehouse",
    // Warehouses
    "view_warehouses",
    "create_warehouses",
    "edit_warehouses",
    "delete_warehouses",
    "view_warehouse_orders",
    // Notifications
    "view_notifications",
    "send_notifications",
    // Exchange Rates
    "view_rates",
    "edit_rates",
  ],
  manager: [
    // Dashboard
    "view_dashboard",
    "view_analytics",
    // Users
    "view_users",
    "edit_users",
    // Products
    "view_products",
    "edit_products",
    // Categories
    "view_categories",
    "create_categories",
    "edit_categories",
    // Offers
    "view_offers",
    "create_offers",
    "edit_offers",
    // Orders
    "view_orders",
    "edit_orders",
    "manage_orders",
    "send_to_warehouse",
    // Warehouses
    "view_warehouses",
    "edit_warehouses",
    "view_warehouse_orders",
    // Notifications
    "view_notifications",
    "send_notifications",
    // Exchange Rates
    "view_rates",
  ],
  warehouse_manager: [
    // Dashboard
    "view_dashboard",
    // Orders
    "view_orders",
    "edit_orders",
    "manage_orders",
    "view_warehouse_orders",
    // Warehouses
    "view_warehouses",
  ],
  driver: [
    // Dashboard
    "view_dashboard",
    // Orders
    "view_orders",
    "edit_orders",
  ],
  customer: [
    // Dashboard
    "view_dashboard",
    // Products
    "view_products",
    // Offers
    "view_offers",
    // Orders
    "view_orders",
    "create_orders",
    "edit_orders",
  ],
};

// Permission categories for UI grouping
export const PERMISSION_CATEGORIES = {
  dashboard: {
    label: "لوحة التحكم",
    permissions: ["view_dashboard", "view_analytics"],
  },
  users: {
    label: "المستخدمين",
    permissions: ["view_users", "create_users", "edit_users", "delete_users"],
  },
  products: {
    label: "المنتجات",
    permissions: ["view_products", "create_products", "edit_products", "delete_products"],
  },
  categories: {
    label: "الأصناف",
    permissions: ["view_categories", "create_categories", "edit_categories", "delete_categories"],
  },
  offers: {
    label: "العروض",
    permissions: ["view_offers", "create_offers", "edit_offers", "delete_offers"],
  },
  orders: {
    label: "الطلبات",
    permissions: ["view_orders", "create_orders", "edit_orders", "delete_orders", "manage_orders", "send_to_warehouse"],
  },

  notifications: {
    label: "الإشعارات",
    permissions: ["view_notifications", "send_notifications"],
  },
  rates: {
    label: "أسعار الصرف",
    permissions: ["view_rates", "edit_rates"],
  },
};

// Permission labels in Arabic
export const PERMISSION_LABELS: Record<Permission, string> = {
  view_dashboard: "عرض لوحة التحكم",
  view_analytics: "عرض التحليلات",
  view_users: "عرض المستخدمين",
  create_users: "إنشاء مستخدمين",
  edit_users: "تعديل المستخدمين",
  delete_users: "حذف المستخدمين",
  manage_users: "إدارة المستخدمين",
  view_products: "عرض المنتجات",
  edit_products: "تعديل المنتجات",
  delete_products: "حذف المنتجات",
  manage_products: "إدارة المنتجات",
  export_products: "تصدير المنتجات",
  view_categories: "عرض الأصناف",
  create_categories: "إنشاء أصناف",
  edit_categories: "تعديل الأصناف",
  delete_categories: "حذف الأصناف",
  view_offers: "عرض العروض",
  create_offers: "إنشاء عروض",
  edit_offers: "تعديل العروض",
  delete_offers: "حذف العروض",
  view_orders: "عرض الطلبات",
  create_orders: "إنشاء طلبات",
  edit_orders: "تعديل الطلبات",
  delete_orders: "حذف الطلبات",
  manage_orders: "إدارة الطلبات",
  send_to_warehouse: "إرسال للمستودع",
  print_orders: "طباعة الطلبات",
  view_warehouses: "عرض المستودعات",
  create_warehouses: "إنشاء مستودعات",
  edit_warehouses: "تعديل المستودعات",
  delete_warehouses: "حذف المستودعات",
  view_warehouse_orders: "عرض طلبات المستودع",
  view_staff: "عرض الموظفين",
  create_staff: "إنشاء موظفين",
  manage_staff: "إدارة الموظفين",
  delete_staff: "حذف الموظفين",
  view_notifications: "عرض الإشعارات",
  send_notifications: "إرسال إشعارات",
  view_rates: "عرض أسعار الصرف",
  edit_rates: "تعديل أسعار الصرف",
  view_roles: "عرض الأدوار",
  create_roles: "إنشاء أدوار",
  edit_roles: "تعديل الأدوار",
  delete_roles: "حذف الأدوار",
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userPermissions: Permission[] | undefined,
  requiredPermission: Permission
): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[] | undefined,
  requiredPermissions: Permission[]
): boolean {
  if (!userPermissions) return false;
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[] | undefined,
  requiredPermissions: Permission[]
): boolean {
  if (!userPermissions) return false;
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: UserRole | number | string): Permission[] {
  // Handle numeric roles (including string numbers)
  if (typeof role === "number" || !isNaN(parseInt(role as string))) {
    const roleNum = parseInt(role as string);
    const roleMap: Record<number, UserRole> = {
      1: "admin",
      2: "manager",
      3: "warehouse_manager",
      4: "driver",
      5: "customer",
    };
    role = roleMap[roleNum] || "customer";
  }
  return ROLE_PERMISSIONS[role as UserRole] || ROLE_PERMISSIONS.customer;
}
