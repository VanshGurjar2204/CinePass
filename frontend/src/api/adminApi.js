import axiosInstance from "./axiosInstance";

export const adminApi = {
  getStats: () => axiosInstance.get("/admin/stats"),
  getReports: () => axiosInstance.get("/admin/reports"),

  // Movies
  createMovie: (data) => axiosInstance.post("/admin/movies", data),
  updateMovie: (id, data) => axiosInstance.patch(`/admin/movies/${id}`, data),
  deleteMovie: (id) => axiosInstance.delete(`/admin/movies/${id}`),

  // Theaters
  createTheater: (data) => axiosInstance.post("/admin/theaters", data),
  updateTheater: (id, data) => axiosInstance.patch(`/admin/theaters/${id}`, data),
  deleteTheater: (id) => axiosInstance.delete(`/admin/theaters/${id}`),

  // Screens
  getScreensByTheater: (theaterId) => axiosInstance.get(`/screens/theater/${theaterId}`),
  createScreen: (data) => axiosInstance.post("/admin/screens", data),
  updateScreen: (id, data) => axiosInstance.patch(`/admin/screens/${id}`, data),
  deleteScreen: (id) => axiosInstance.delete(`/admin/screens/${id}`),

  // Seats
  generateSeatLayout: (data) => axiosInstance.post("/admin/seats/generate", data),
  updateSeat: (id, data) => axiosInstance.patch(`/admin/seats/${id}`, data),

  // Shows
  createShow: (data) => axiosInstance.post("/admin/shows", data),
  updateShow: (id, data) => axiosInstance.patch(`/admin/shows/${id}`, data),
  deleteShow: (id) => axiosInstance.delete(`/admin/shows/${id}`),

  // Users
  getUsers: (params) => axiosInstance.get("/admin/users", { params }),
  toggleUserStatus: (id) => axiosInstance.patch(`/admin/users/${id}/toggle-status`),

  // Bookings
  getBookings: (params) => axiosInstance.get("/admin/bookings", { params }),

  // Reviews
  getReviews: () => axiosInstance.get("/admin/reviews"),
  deleteReview: (id) => axiosInstance.delete(`/admin/reviews/${id}`),
};

