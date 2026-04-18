import { create } from "zustand";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

/**
 * Auth Store - Global authentication state
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("auth_token") || null,
  isLoading: false,
  error: null,

  register: async (email, password, firstName, lastName, businessName) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
        businessName,
      });
      localStorage.setItem("auth_token", data.token);
      set({ token: data.token, user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("auth_token", data.token);
      set({ token: data.token, user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, token: null });
  },

  getCurrentUser: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error });
      throw error;
    }
  },
}));

/**
 * Business Store - Business management state
 */
export const useBusinessStore = create((set) => ({
  businesses: [],
  currentBusiness: null,
  isLoading: false,

  fetchBusinesses: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/auth/me");
      set({ businesses: data.businesses || [], isLoading: false });
      return data.businesses;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createBusiness: async (name, industry, website) => {
    try {
      const { data } = await api.post("/business", { name, industry, website });
      set((state) => ({
        businesses: [...state.businesses, data.business],
        currentBusiness: data.business,
      }));
      return data.business;
    } catch (error) {
      throw error;
    }
  },

  setBusiness: (business) => set({ currentBusiness: business }),

  getBusinessStats: async (businessId) => {
    try {
      const { data } = await api.get(`/business/${businessId}/stats`);
      return data;
    } catch (error) {
      throw error;
    }
  },
}));

/**
 * Product Store - Product management state
 */
export const useProductStore = create((set) => ({
  products: [],
  currentProduct: null,
  isLoading: false,

  fetchProducts: async (businessId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/products/business/${businessId}`);
      set({ products: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createProduct: async (businessId, name, description, category) => {
    try {
      const { data } = await api.post("/products", {
        businessId,
        name,
        description,
        category,
      });
      set((state) => ({
        products: [...state.products, data.product],
      }));
      return data.product;
    } catch (error) {
      throw error;
    }
  },

  setProduct: (product) => set({ currentProduct: product }),

  getProductSummary: async (productId) => {
    try {
      const { data } = await api.get(`/products/${productId}/summary`);
      return data;
    } catch (error) {
      throw error;
    }
  },
}));

/**
 * Review Store - Review and analytics state
 */
export const useReviewStore = create((set) => ({
  reviews: [],
  analytics: null,
  isLoading: false,

  fetchReviews: async (productId, limit = 50, offset = 0, sentiment = null) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/reviews/${productId}`, {
        params: { limit, offset, sentiment },
      });
      set({ reviews: data.reviews, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  submitReview: async (productId, text, rating, source = "manual") => {
    try {
      const { data } = await api.post("/reviews", {
        productId,
        text,
        rating,
        source,
      });
      set((state) => ({
        reviews: [data.review, ...state.reviews],
      }));
      return data.review;
    } catch (error) {
      throw error;
    }
  },

  getAnalytics: async (productId) => {
    try {
      const { data } = await api.get(`/reviews/${productId}/analytics`);
      set({ analytics: data });
      return data;
    } catch (error) {
      throw error;
    }
  },

  updateReview: async (reviewId, response, isResolved) => {
    try {
      const { data } = await api.put(`/reviews/${reviewId}`, {
        response,
        isResolved,
      });
      return data.review;
    } catch (error) {
      throw error;
    }
  },
}));

export { api };
