export type UserRole = "admin" | "manager" | "warehouse_manager" | "driver" | "customer";
export type UserStatus = "pending" | "active" | "inactive" | "rejected";
export type OrderStatus = "pending" | "approved" | "processing" | "delivered" | "rejected";
export type OrderType = "delivery" | "pickup";
export type PurchaseType = "parcel" | "piece";

// Permissions
export type Permission =
  // Dashboard
  | "view_dashboard"
  | "view_analytics"
  // Users
  | "view_users"
  | "create_users"
  | "edit_users"
  | "delete_users"
  | "manage_users"
  | "manage_user_roles"
  // Products
  | "view_products"
  | "create_products"
  | "edit_products"
  | "delete_products"
  | "manage_products"
  | "export_products"
  // Categories
  | "view_categories"
  | "create_categories"
  | "edit_categories"
  | "delete_categories"
  // Offers
  | "view_offers"
  | "create_offers"
  | "edit_offers"
  | "delete_offers"
  // Orders
  | "view_orders"
  | "create_orders"
  | "edit_orders"
  | "delete_orders"
  | "manage_orders"
  | "send_to_warehouse"
  | "print_orders"
  // Warehouses
  | "view_warehouses"
  | "create_warehouses"
  | "edit_warehouses"
  | "delete_warehouses"
  | "view_warehouse_orders"
  // Staff
  | "view_staff"
  | "create_staff"
  | "manage_staff"
  | "delete_staff"
  // Notifications
  | "view_notifications"
  | "send_notifications"
  // Exchange Rates
  | "view_rates"
  | "edit_rates";

export interface Role {
  id: number;
  name: string;
  name_ar: string;
  permissions: Permission[];
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  zone?: string;
  shop_name?: string;
  address?: string;
  activated: boolean;
  status?: string;
  created_at?: string;
  role?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  permissions?: Permission[];
}

export interface Category {
  id: number;
  name: string;
  image?: string;
  products_count?: number;
}

export interface Product {
  id: number;
  name: string;
  price_piece: number;
  price_carton: number;
  quantity: number;
  category_id: number;
  category?: Category;
  image?: string;
}

export interface Offer {
  id: number;
  image: string;
  description: string;
  expires_at: string;
  product_id: number;
  product?: Product;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  purchase_type: PurchaseType;
  price: number;
}

export interface Order {
  id: number;
  user: User;
  status: OrderStatus;
  type: OrderType;
  notes?: string;
  items: OrderItem[];
  total_usd: number;
  total_syp: number;
  warehouse_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  manager?: User;
  orders_count?: number;
  pending_count?: number;
  completed_count?: number;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  target: "all" | "user" | "group";
  user_ids?: number[];
  sent_at: string;
}

export interface ExchangeRate {
  id: number;
  currency_name: string;
  rate: number;
  is_default: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  total_users: number;
  pending_users: number;
  total_products: number;
  low_stock_products: number;
  total_revenue_usd: number;
  exchange_rate: number;
}
