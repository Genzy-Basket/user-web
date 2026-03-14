import apiClient from "../api.client";

const AUTH_BASE = "/auth";

const authAPI = {
  register: async (userData) => {
    const response = await apiClient.post(`${AUTH_BASE}/register`, userData);

    if (response.data.success && response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }

    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post(`${AUTH_BASE}/login`, credentials);

    if (response.data.success && response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error parsing user data:", error);
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem("authToken");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },

  checkApprovalStatus: async (userId) => {
    const response = await apiClient.get(`${AUTH_BASE}/approval-status/${userId}`);
    return response.data;
  },
};

export default authAPI;
