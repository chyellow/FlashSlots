import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const MOCK = false;

const mockProfiles = {
  vendor: {
    city: "New Brunswick",
    display_name: "Vendor",
    state: "NJ",
    phone: "(609) 254-1312",
    avatar: "https://barbercraftsd.com/wp-content/uploads/2022/09/pexels-photo-7697401-1-scaled.jpg",
  },
  client: {
    display_name: "Client 1",
    city: "Piscataway",
    state: "NJ",
    phone: "(732) 555-0912",
    avatar: null,
  },
};

export const getProfile = async (username) => {
  if (MOCK) {
    const profile = mockProfiles[username.toLowerCase()];
    if (!profile) return null;
    return profile;
  }
  return apiFetch(`/profiles/${username}`);
};

export const getMyProfile = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/me/profile`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Could not load profile");
  return res.json();
};

export const updateMyProfile = async (data) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/me/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Could not update profile");
  return res.json();
};