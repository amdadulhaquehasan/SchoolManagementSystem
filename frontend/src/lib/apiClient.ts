import axios, { AxiosError } from "axios";
import type { ApiErrorBody } from "@/types/dtos";

export const API_HOST =
  process.env.NEXT_PUBLIC_API_HOST?.replace(/\/+$/, "") || "https://localhost:7174";
export const API_BASE_URL = `${API_HOST}/api`;

export const TOKEN_STORAGE_KEY = "sms_token";
export const USER_STORAGE_KEY = "sms_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? ({} as typeof config.headers);
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Normalized error shape every screen can rely on, regardless of what the server sent back. */
export interface NormalizedApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export function normalizeError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorBody>;
    if (axiosErr.response) {
      const body = axiosErr.response.data;
      return {
        status: axiosErr.response.status,
        message: body?.message || body?.title || "Something went wrong. Please try again.",
        fieldErrors: body?.errors,
      };
    }
    if (axiosErr.request) {
      return { status: 0, message: "Could not reach the server. Check your connection and the API URL." };
    }
  }
  return { status: 0, message: "An unexpected error occurred." };
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?expired=1";
        }
      }
    }
    return Promise.reject(error);
  }
);

/** Resolves a relative file path (e.g. "/assignments/abc.pdf") returned by the API into a full URL. */
export function resolveFileUrl(relativeUrl?: string | null): string | null {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) return relativeUrl;
  return `${API_HOST}${relativeUrl.startsWith("/") ? "" : "/"}${relativeUrl}`;
}
