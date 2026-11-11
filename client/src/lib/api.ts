import axios from "axios";
import { clearSession } from "./session";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/users/login")
    )
      clearSession();
    return Promise.reject(error);
  },
);
export function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : "Unable to reach PetVet. Check your connection and try again.")
    );
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
export const refreshData = () => window.dispatchEvent(new Event("petvet:data"));
