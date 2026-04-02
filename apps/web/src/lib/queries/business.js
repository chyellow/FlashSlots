import { apiFetch } from "@/lib/api";

export const getMyBusiness = async () => {
    return apiFetch(`/businesses/me`);
};

export const updateMyBusiness = async (payload) => {
    return apiFetch(`/businesses/me`, {
        method: "PATCH",
        body: payload,
    });
};