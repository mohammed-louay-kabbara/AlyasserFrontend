import api from "./axiosInstance";

export const getDashboardStats = async () => {
  return api.get("/admin/dashboard");
};
