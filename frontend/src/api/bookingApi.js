import axiosInstance from "./axiosInstance";

export const bookingApi = {
  lockSeats: (data) => axiosInstance.post("/bookings/lock-seats", data),
  releaseSeats: (data) => axiosInstance.post("/bookings/release-seats", data),
  create: (data) => axiosInstance.post("/bookings", data),
  getMyBookings: (params) => axiosInstance.get("/bookings/my", { params }),
  getById: (id) => axiosInstance.get(`/bookings/${id}`),
  cancel: (id) => axiosInstance.patch(`/bookings/${id}/cancel`),
};

