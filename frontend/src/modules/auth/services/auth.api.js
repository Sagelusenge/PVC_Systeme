import { api } from "../../../services/api";
export const login = (credentials) => api("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
export const getProfile = () => api("/auth/me");
