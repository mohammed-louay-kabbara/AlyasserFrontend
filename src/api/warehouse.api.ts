import api from "./axiosInstance";

// Admin Warehouses API
export const getAdminWarehouses = async (params?: { search?: string }) => {
  return api.get("/admin/warehouses", { params });
};

export const createWarehouse = (data: FormData) => api.post("/admin/warehouses", data);
export const updateWarehouse = (id: number, data: FormData) => api.put(`/admin/warehouses/${id}`, data);
export const deleteWarehouse = (id: number) => api.delete(`/admin/warehouses/${id}`);
