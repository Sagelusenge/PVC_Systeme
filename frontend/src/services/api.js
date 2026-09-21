const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://pvc-systeme-api.onrender.com/api" : "http://localhost:5000/api");

export async function api(path, options = {}) {
  const token = localStorage.getItem("pvc_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message || "Une erreur est survenue");
    error.status = response.status;
    error.details = payload?.details;
    throw error;
  }
  return payload;
}

export const get = (path) => api(path).then((response) => response?.data);
export const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body) }).then((response) => response?.data);
export const patch = (path, body) => api(path, { method: "PATCH", body: JSON.stringify(body) }).then((response) => response?.data);
export const remove = (path) => api(path, { method: "DELETE" });

export default api;
