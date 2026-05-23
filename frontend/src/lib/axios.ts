import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

function getAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("erp-token="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("erp-refresh-token="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;SameSite=Lax`;
}

function clearAuthCookies() {
  document.cookie = "erp-token=;path=/;max-age=0";
  document.cookie = "erp-refresh-token=;path=/;max-age=0";
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  // sem withCredentials
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function notifySubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Interceptor de request — lê cookie primeiro, Zustand como fallback
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cookieToken = getAccessToken();
  const zustandToken = useAuthStore.getState().accessToken;
  
  console.log("[AXIOS REQUEST]", config.url);
  console.log("[AXIOS] cookie token:", cookieToken ? cookieToken.substring(0, 20) + "..." : "NULL");
  console.log("[AXIOS] zustand token:", zustandToken ? zustandToken.substring(0, 20) + "..." : "NULL");

  const token = cookieToken ?? zustandToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de response — trata 401 com refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) throw new Error("no_refresh_token");

      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("refresh_failed");

      const data = await res.json();

      setCookie("erp-token", data.accessToken);
      setCookie("erp-refresh-token", data.refreshToken);
      useAuthStore.getState().setAuth(data.accessToken, data.usuario);

      notifySubscribers(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;

      return api(original);
    } catch {
	  // Não limpa cookies nem redireciona — deixa o erro propagar
	  isRefreshing = false;
	  return Promise.reject(error);
	} finally {
	  isRefreshing = false;
	}
  }
);

export default api;