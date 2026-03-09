import axios from "axios";
import { errorBus } from "./errorBus";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ── Request: attach token ────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (import.meta.env.DEV) {
    console.log(
      `[API] ${config.method.toUpperCase()} ${config.url}`,
      config.data,
    );
  }
  return config;
});

// ── Response: normalize errors ───────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred.";

    if (error.response) {
      const { status, data } = error.response;
      message = data?.message || message;

      if (status === 401) {
        // Only treat as session expiry if the request actually had a token.
        // A 401 on a public endpoint (e.g. /settings when unauthenticated)
        // should not clear auth state or trigger a logout event.
        const hadToken = !!error.config?.headers?.Authorization;
        if (hadToken) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth:logout"));
        }
      }

      if (status === 403) {
        message = data?.message || "You don't have permission to do that.";
      }
    } else if (error.request) {
      message = "Network error. Please check your connection.";
    }

    // Attach normalized message so callers get a clean string
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.raw = error;

    return Promise.reject(normalized);
  },
);

export default apiClient;
