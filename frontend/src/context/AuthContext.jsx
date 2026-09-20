import { createContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pvc_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("pvc_token")));

  useEffect(() => {
    if (!localStorage.getItem("pvc_token")) return setLoading(false);
    api("/auth/me").then((response) => {
      setUser(response.data);
      localStorage.setItem("pvc_user", JSON.stringify(response.data));
    }).catch(() => {
      localStorage.removeItem("pvc_token"); localStorage.removeItem("pvc_user"); setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user, loading,
    async login(credentials) {
      const response = await api("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
      localStorage.setItem("pvc_token", response.data.token);
      localStorage.setItem("pvc_user", JSON.stringify(response.data.user));
      setUser(response.data.user);
    },
    async updateProfile(profile) {
      const response = await api("/auth/me", { method: "PATCH", body: JSON.stringify(profile) });
      localStorage.setItem("pvc_user", JSON.stringify(response.data));
      setUser(response.data);
      return response.data;
    },
    logout() { localStorage.removeItem("pvc_token"); localStorage.removeItem("pvc_user"); setUser(null); },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
