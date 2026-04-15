import { apiFetch } from "@/lib/api";

export const updateMyBusiness = async (payload) => {
    return apiFetch(`/businesses/me`, {
        method: "PATCH",
        body: payload,
    });
};
