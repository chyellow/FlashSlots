import { apiFetch } from "@/lib/api";

const MOCK = true;

const mockProfiles = {
  ademir: {
    display_name: "Ademir",
    city: "New Brunswick",
    state: "NY",
    phone: "(609) 254-1312",
    avatar: null,
  },
  manuel: {
    display_name: "Manuel Lopes",
    city: "Los Angeles",
    state: "CA",
    phone: "(323) 555-0912",
    avatar: "https://barbercraftsd.com/wp-content/uploads/2022/09/pexels-photo-7697401-1-scaled.jpg",
  },
  rutgers: {
    display_name: "Rutgers University",
    city: "New Brunswick",
    state: "NJ",
    phone: "(732) 445-4636",
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