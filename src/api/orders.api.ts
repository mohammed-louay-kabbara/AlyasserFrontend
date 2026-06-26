import api from "./axiosInstance";

// Admin Orders API
export const getAdminOrders = async (params?: {
  search?: string;
  date?: string;
  status?: string;
  area?: string;
  delivery_type?: string;
  page?: number;
  per_page?: number;
}) => {
  return api.get("/admin/orders", { params });
};

export const sendOrderToWarehouse = (id: number) => {
  return api.post(`/admin/orders/${id}/send-to-warehouse`);
};

export const bulkSendOrdersToWarehouse = (order_ids: string, warehouse_id: number) => {
  return api.post("/admin/orders/bulk-send", { order_ids, warehouse_id });
};

export const printOrders = (ids: string) => {
  return api.get("/admin/orders/print", { params: { ids }, responseType: 'blob' });
};

export const updateAdminOrder = (id: number, data: any) => {
  return api.put(`/admin/orders/${id}`, data);
};

export const getAdminOrderDetail = (id: number) => {
  return api.get(`/admin/orders/${id}`);
};

/**
 * 根据订单号获取管理员订单详情
 * @param orderNumber - 订单号，用于标识特定订单的唯一字符串
 * @returns 返回API请求结果，包含订单的详细信息
 */
export const getAdminOrderDetailByNumber = (orderNumber: string) => {
  return api.get(`/admin/orders/by-number/${orderNumber}`); // 发送GET请求到指定端点，路径中包含订单号
};

export const deleteAdminOrder = (id: number, deletion_reason?: string) => {
  return api.delete(`/admin/orders/${id}`, { data: { deletion_reason } });
};

export const getUserOrders = (userId: number, page?: number, per_page?: number) => {
  return api.get(`/admin/orders/user/${userId}/json`, { params: { page, per_page } });
};

export const getUserOrdersByUserNumber = (userNumber: string, page?: number, per_page?: number) => {
  return api.get(`/admin/orders/user-number/${encodeURIComponent(userNumber)}/json`, { params: { page, per_page } });
};

export const getWarehouseOrders = (warehouseId: number) => {
  return api.get(`/admin/orders/warehouse/${warehouseId}/json`);
};

export const getWarehouseUserOrders = () => {
  return api.get('/warehouse/orders');
};

export const markAsReady = (id: number) => {
  return api.post(`/warehouse/orders/${id}/ready`);
};

export const exportOrderToAmeenTxt = (id: number) => {
  return api.get(`/admin/orders/export-ameen/${id}`, { responseType: 'blob' });
};

export const exportMultipleOrdersToAmeenTxt = (orderIds: number[]) => {
  return api.post('/admin/orders/export-ameen-multiple', { order_ids: orderIds }, { responseType: 'blob' });
};

export const updateOrderStatus = (id: number, status: string) =>
  api.put(`/orders/${id}/status`, { status });

// Public Orders API (for mobile app)
export const getOrders = async (params?: {
  page?: number;
  status?: string;
}) => {
  return api.get("/get_order", { params });
};

export const getOrderDetail = (id: number) => api.get(`/order_details/${id}`);

export const updateOrder = (id: number, data: { notes?: string; items: Array<{ product_id: number; quantity: number; purchase_type: string }> }) =>
  api.put(`/orders/${id}/update`, data);

export const addOrder = (data: { notes?: string; items: Array<{ product_id: number; quantity: number; purchase_type: string }> }) =>
  api.post("/add_order", data);

export const getExchangeRate = async () => {
  return api.get("/get_exchange_rate");
};

export const updateExchangeRate = (rate: number) =>
  api.post("/ExchangeRate", { rate, currency_name: "SYP", is_default: 1 });

export const addOrderItem = (orderId: number, data: { product_id: number; quantity: number; purchase_type: string }) =>
  api.post(`/admin/orders/${orderId}/items`, data);

export const deleteOrderItem = (orderId: number, itemId: number) =>
  api.delete(`/admin/orders/${orderId}/items/${itemId}`);

export const toggleOrderSync = (id: number) =>
  api.post(`/admin/orders/${id}/is_synced`);
