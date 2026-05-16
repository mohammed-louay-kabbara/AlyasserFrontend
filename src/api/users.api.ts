import api from "./axiosInstance";

// Admin Users API
export const getAdminUsers = async (params?: { search?: string; activated?: string; status?: string }) => {
  return api.get("/admin/users", { params });
};

export const bulkToggleUserStatus = (ids: number[], activated: boolean) => {
  return api.post("/admin/users/bulk-toggle-status", { ids, activated });
};

export const resetUserPassword = (id: number, password: string) => {
  return api.post(`/admin/users/${id}/reset-password`, { password });
};

export const approveUser = (id: number) => {
  return api.post(`/admin/users/${id}/approve`);
};

export const rejectUser = (id: number) => {
  return api.post(`/admin/users/${id}/reject`);
};

// Auth API
export const updateUserRole = (id: number, role: number) => {
  return api.post(`/admin/users/${id}/update-role`, { role });
};

export const updateUserProfile = (data: any) => {
  return api.post("/profile/update", data);
};

export const getAdminUserById = () => {
  return api.get(`/me`);
};
