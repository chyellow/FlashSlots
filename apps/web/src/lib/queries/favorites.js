import { apiFetch } from "@/lib/api"

export const getMyFavorites = async () => apiFetch(`/favorites/me`)

export const addFavorite = async (businessId) =>
  apiFetch(`/favorites/${businessId}`, { method: "POST" })

export const removeFavorite = async (businessId) =>
  apiFetch(`/favorites/${businessId}`, { method: "DELETE" })
