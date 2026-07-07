import api from "./axiosInstance";

// Admin Products API
export const getAdminProducts = async (params?: { search?: string; stock_status?: string; category_id?: number; page?: number; per_page?: number }) => {
  return api.get("/admin/products", { params });
};

export const searchAdminProducts = async (params?: { search?: string; stock_status?: string; category_id?: number; page?: number }) => {
  return api.get("/admin/products/search", { params });
};

export const syncWithAmeen = () => api.post("/admin/products/sync-ameen");

export const getSyncDate = () => api.get("/admin/products/sync-date");

export const uploadProductImage = (id: number, image: File) => {
  const form = new FormData();
  form.append("image", image, image.name);
  return api.post(`/admin/products/${id}/upload-image`, form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteProductImage = (id: number) => api.post(`/admin/products/${id}/delete-image`);

export const exportProductsExcel = (selectedIds?: number[]) => {
  const params = selectedIds && selectedIds.length > 0 ? { ids: selectedIds } : {};
  return api.get("/admin/products/export-excel", { params, responseType: 'blob' });
};

export const exportProductsPdf = (selectedIds?: number[]) => {
  const params = selectedIds && selectedIds.length > 0 ? { ids: selectedIds } : {};
  return api.get("/admin/products/export-pdf", { params, responseType: 'blob' });
};

// Public Products API (for mobile app)
export const getProducts = async (params?: { page?: number; category_id?: number; search?: string }) => {
  return api.get("/Product", { params });
};

export const searchProducts = (name: string) => api.get("/Product-search", { params: { name } });

export const createProduct = (data: FormData) => api.post("/Product", data);

export const updateProduct = (id: number, data: FormData) => api.post(`/Product/${id}`, data);

export const deleteProduct = (id: number) => api.delete(`/Product/${id}`);
