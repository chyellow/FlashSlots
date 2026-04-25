import { apiFetch } from "@/lib/api";

export const getMyReviews = async () => {
    return apiFetch(`/reviews/me`);
};

export const createReview = async (reservationId, rating, comment = null) => {
    return apiFetch(`/reviews`, {
        method: "POST",
        body: { reservation_id: reservationId, rating, comment },
    });
};

export const getBusinessReviews = async (businessId) => {
    return apiFetch(`/reviews/business/${businessId}`);
};

export const getBusinessRating = async (businessId) => {
    return apiFetch(`/reviews/business/${businessId}/rating`);
};

export const getClientStats = async (accountId) => {
    return apiFetch(`/reviews/client/${accountId}/stats`);
};

export const completeReservation = async (reservationId) => {
    return apiFetch(`/reservations/${reservationId}/complete`, {
        method: "POST",
    });
};
