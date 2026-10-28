import axiosInstance from "./axiosInstance";

export const screenApi = {
  getByTheater: (theaterId) => axiosInstance.get(`/screens/theater/${theaterId}`),
  getById: (id) => axiosInstance.get(`/screens/${id}`),
};

