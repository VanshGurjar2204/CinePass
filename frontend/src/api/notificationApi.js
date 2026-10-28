import axiosInstance from "./axiosInstance";

export const notificationApi = {
  getAll: () => axiosInstance.get("/notifications"),
  markAsRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosInstance.patch("/notifications/read-all"),
  delete: (id) => axiosInstance.delete(`/notifications/${id}`),
};

