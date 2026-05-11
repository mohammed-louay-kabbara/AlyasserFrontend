import api from "./axiosInstance";

export const getAdminStaff = async (params?: any) => {
  return api.get("/admin/staff", { params });
};

export const createStaff = async (staffData: any) => {
  return api.post("/admin/staff", staffData);
};

export const updateStaff = async (id: number, staffData: any) => {
  return api.put(`/admin/staff/${id}`, staffData);
};

export const deleteStaff = async (id: number) => {
  return api.delete(`/admin/staff/${id}`);
};

export const getStaffDetail = async (id: number) => {
  return api.get(`/admin/staff/${id}`);
};
