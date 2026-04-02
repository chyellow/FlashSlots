import { apiFetch } from "@/lib/api";

export const getOpenings = async (mine = false) => {
    const url = mine ? `/openings?mine=true` : `/openings`;
    return apiFetch(url);
};

export const getOpening = async (openingId) => {
    return apiFetch(`/openings/${openingId}`);
};

export const postOpening = async (payload) => {
    return apiFetch(`/openings`, {
        method: "POST",
        body: payload,
    });
};

export const patchOpening = async (openingId, payload) => {
    return apiFetch(`/openings/${openingId}`, {
        method: "PATCH",
        body: payload,
    });
};

export const deleteOpening = async (openingId) => {
    return apiFetch(`/openings/${openingId}`, {
        method: "DELETE",
    });
};