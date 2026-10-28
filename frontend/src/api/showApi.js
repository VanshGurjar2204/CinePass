import axiosInstance from "./axiosInstance";

export const showApi = {
  getAll: (params) => axiosInstance.get("/shows", { params }),
  getById: (id) => axiosInstance.get(`/shows/${id}`),
  getSeats: (showId) => axiosInstance.get(`/shows/${showId}/seats`),
};

