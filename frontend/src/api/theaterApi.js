import axiosInstance from "./axiosInstance";

export const theaterApi = {
  getAll: (params) => axiosInstance.get("/theaters", { params }),
  getById: (id) => axiosInstance.get(`/theaters/${id}`),
  getCities: () => axiosInstance.get("/theaters/cities"),
};

