import { apiFetch } from "@/lib/api";

const MOCK = true;

const mockProfiles = {
  vendor: {
    display_name: "Vendor",
    city: "New Brunswick",
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