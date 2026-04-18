import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  refresh: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
};

export const businessService = {
  create: (data) => api.post("/businesses", data),
  get: (businessId) => api.get(`/businesses/${businessId}`),
  update: (businessId, data) => api.put(`/businesses/${businessId}`, data),
  analytics: (businessId) => api.get(`/businesses/${businessId}/analytics`),
  addUser: (businessId, data) =>
    api.post(`/businesses/${businessId}/users`, data),
  removeUser: (businessId, userId) =>
    api.delete(`/businesses/${businessId}/users/${userId}`),
};

export const productService = {
  create: (businessId, data) => api.post(`/products/${businessId}`, data),
  list: (businessId, params) => api.get(`/products/${businessId}`, { params }),
  get: (businessId, productId) =>
    api.get(`/products/${businessId}/${productId}`),
  update: (businessId, productId, data) =>
    api.put(`/products/${businessId}/${productId}`, data),
  delete: (businessId, productId) =>
    api.delete(`/products/${businessId}/${productId}`),
};

export const reviewService = {
  submit: (data) => api.post("/reviews", data),
  list: (businessId, params) => api.get(`/reviews/${businessId}`, { params }),
  listByProduct: (businessId, productId, params) =>
    api.get(`/reviews/${businessId}/product/${productId}`, { params }),
  analytics: (businessId) => api.get(`/reviews/${businessId}/analytics`),
  resolve: (businessId, reviewId, data) =>
    api.put(`/reviews/${businessId}/resolve/${reviewId}`, data),
  delete: (businessId, reviewId) =>
    api.delete(`/reviews/${businessId}/${reviewId}`),
};

export default api;
