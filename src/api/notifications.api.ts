import api from "./axiosInstance";

// Admin Notifications API
export const getUsersList = async () => {
  return api.get("/admin/users-list");
};

export const sendAdminNotification = (data: { title: string; body: string; user_ids: number[]; destination?: string }) => {
  return api.post("/admin/notifications/send", data);
};

export const getUserNotifications = (userId: number | string, status: "all" | "read" | "unread" = "all") => {
  const params = status === "all" ? {} : { status };
  return api.get(`/admin/notifications/${userId}/json`, { params });
};

export const markNotificationAsRead = (notificationId: number) => {
  return api.put(`/admin/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = (userId: number) => {
  return api.put(`/admin/notifications/${userId}/read-all`);
};

export const deleteNotification = (notificationId: number) => {
  return api.delete(`/admin/notifications/${notificationId}`);
};

// Public Notifications API (for mobile app)
export const sendNotification = (data: { title: string; body: string; user_ids: number[] }) =>
  api.post("/sendNotification", data);

export const getMyNotifications = () => api.get("/my_Notification");
export const readAllNotifications = () => api.get("/read_all");
export const sendPushNotification = (data: any) => api.post("/sendPushNotification", data);

export const getNotificationHistory = () => api.get("/notifications");
