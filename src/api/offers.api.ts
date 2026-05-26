import api from "./axiosInstance";

// Admin Offers API
export const getAdminOffers = async (params?: any) => {
  return api.get("/admin/offers", { params });
};

export const getAdminOffer = (id: number) => {
  return api.get(`/admin/offers/${id}`);
};

// Public Offers API (for mobile app)
export const getOffers = () => api.get("/offers");
export const createOffer = (data: FormData) => 
  api.post("/offers", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateOffer = (id: number, data: FormData) => 
  api.post(`/admin/offers_update/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteOffer = (id: number) => api.delete(`/offers/${id}`);
