import api from "./axiosInstance";

// Admin Categories API
export const getAdminCategories = async (params?: { search?: string }) => {
  return api.get("/admin/categories", { params });
};

// Public Categories API (for mobile app)
export const getCategories = () => api.get("/Category");
export const createCategory = (data: FormData) => api.post("/admin/categories", data, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const updateCategory = (id: number, data: FormData) => api.post(`/admin/categories/${id}`, data, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const deleteCategory = (id: number) => api.delete(`/admin/categories/${id}`);

export const getCategoryProducts = (id: number) => api.get(`/Category/${id}/products`);
export const searchCategory = (id: number) => api.get(`/category_search/${id}`);
export const getSearchScreenData = () => api.get("/getSearchScreenData");
export const assignProductsToCategory = (categoryId: number, productIds: number[]) => {
  return api.post(`/admin/categories/${categoryId}/products`, { product_ids: productIds });
};

export const removeProductFromCategory = (categoryId: number, productId: number) => {
  return api.delete(`/admin/categories/${categoryId}/products/${productId}`);
};
