import { clearAuth, getToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    auth = true,
  } = options;

  const finalHeaders = { ...headers };

  if (body && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
        (data && data.detail) ||
        (typeof data === "string" ? data : "Request failed");
    if (response.status === 401) {
      clearAuth();
    }
    throw new Error(message);
  }

  return data;
}