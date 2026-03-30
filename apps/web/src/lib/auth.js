// apps/web/src/lib/auth.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// --- Token storage ---
export function getToken() {
  return localStorage.getItem("token");
}

export function getRole() {
  return localStorage.getItem("role");
}

export function getAccountId() {
  return localStorage.getItem("account_id");
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("account_id");
}

// --- API calls ---
export async function loginRequest(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(
  typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)
    );
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("account_id", String(data.account_id));
  return data;
}

export async function registerRequest(email, password, role, display_name, username, phone) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role, display_name, username, phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(
    typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)
  );
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("account_id", String(data.account_id));
  return data;
}