import { apiFetch } from "@/lib/api";

export const updateMyBusiness = async (payload) => {
    return apiFetch(`/businesses/me`, {
        method: "PATCH",
        body: payload,
    });
};

export const getBusinessById = async (businessId) => {
    return apiFetch(`/businesses/${businessId}`);
};
