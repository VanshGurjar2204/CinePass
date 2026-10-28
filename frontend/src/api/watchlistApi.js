import axiosInstance from "./axiosInstance";

export const watchlistApi = {
  getAll: () => axiosInstance.get("/watchlist"),
  check: (movieId) => axiosInstance.get(`/watchlist/check/${movieId}`),
  add: (movieId) => axiosInstance.post(`/watchlist/${movieId}`),
  remove: (movieId) => axiosInstance.delete(`/watchlist/${movieId}`),
};

