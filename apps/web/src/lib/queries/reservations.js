import { apiFetch } from "@/lib/api";

export const holdReservation = async (openingId) => {
    return apiFetch(`/reservations/hold`, {
        method: "POST",
        body: { opening_id: openingId },
    });
};

export const confirmReservation = async (reservationId) => {
    return apiFetch(`/reservations/${reservationId}/confirm`, {
        method: "POST",
    });
};

export const cancelReservation = async (reservationId, reason = null) => {
    const url = reason 
        ? `/reservations/${reservationId}/cancel?reason=${encodeURIComponent(reason)}`
        : `/reservations/${reservationId}/cancel`;
        
    return apiFetch(url, {
        method: "POST",
    });
};

export const getMyReservations = async () => {
    return apiFetch(`/reservations/me`);
};

export const getBusinessReservations = async () => {
    return apiFetch(`/reservations/business/me`);
};