import axiosInstance from "./axiosInstance";

export const movieApi = {
  getAll: (params) => axiosInstance.get("/movies", { params }),
  getFeatured: () => axiosInstance.get("/movies/featured"),
  getGenres: () => axiosInstance.get("/movies/genres"),
  getByIdOrSlug: (idOrSlug) => axiosInstance.get(`/movies/${idOrSlug}`),
  getShows: (id, params) => axiosInstance.get(`/movies/${id}/shows`, { params }),
  getReviews: (movieId) => axiosInstance.get(`/movies/${movieId}/reviews`),
  addReview: (movieId, data) => axiosInstance.post(`/movies/${movieId}/reviews`, data),
};

