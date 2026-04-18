import { create } from "zustand";
import {
  authService,
  businessService,
  reviewService,
  productService,
} from "../services/api";

export const useAuthStore = create((set) => ({
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  token: localStorage.getItem("token") || null,
  businesses: [],
  currentBusiness: localStorage.getItem("currentBusiness")
    ? JSON.parse(localStorage.getItem("currentBusiness"))
    : null,

  login: async (email, password) => {
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("businesses", JSON.stringify(data.businesses));
      set({
        user: data.user,
        token: data.token,
        businesses: data.businesses,
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const { data } = await authService.register(userData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("businesses", JSON.stringify([data.business]));
      set({
        user: data.user,
        token: data.token,
        businesses: [data.business],
        currentBusiness: data.business,
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  setCurrentBusiness: (business) => {
    localStorage.setItem("currentBusiness", JSON.stringify(business));
    set({ currentBusiness: business });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("businesses");
    localStorage.removeItem("currentBusiness");
    set({
      user: null,
      token: null,
      businesses: [],
      currentBusiness: null,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const { data } = await authService.me();
      set({
        user: data.user,
        businesses: data.businesses,
      });
      return true;
    } catch {
      set({ user: null, token: null });
      return false;
    }
  },
}));

export const useBusinessStore = create((set) => ({
  businesses: [],
  currentBusiness: null,
  analytics: null,
  loading: false,

  fetchBusinesses: async () => {
    set({ loading: true });
    try {
      const { data } = await authService.me();
      set({ businesses: data.businesses });
      return data.businesses;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchAnalytics: async (businessId) => {
    set({ loading: true });
    try {
      const { data } = await businessService.analytics(businessId);
      set({ analytics: data });
      return data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createBusiness: async (data) => {
    try {
      const { data: newBusiness } = await businessService.create(data);
      set((state) => ({
        businesses: [...state.businesses, newBusiness],
      }));
      return newBusiness;
    } catch (error) {
      throw error;
    }
  },
}));

export const useReviewStore = create((set) => ({
  reviews: [],
  analytics: null,
  loading: false,
  error: null,

  fetchReviews: async (businessId, params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await reviewService.list(businessId, params);
      set({ reviews: data.reviews });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchAnalytics: async (businessId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await reviewService.analytics(businessId);
      set({ analytics: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  submitReview: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: review } = await reviewService.submit(data);
      set((state) => ({
        reviews: [review, ...state.reviews],
      }));
      return review;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (businessId, params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await productService.list(businessId, params);
      set({ products: data.products });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (businessId, data) => {
    set({ loading: true, error: null });
    try {
      const { data: product } = await productService.create(businessId, data);
      set((state) => ({
        products: [...state.products, product],
      }));
      return product;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
