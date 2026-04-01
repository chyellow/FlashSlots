import { apiFetch } from "../lib/api";

export function register(payload) {
    return apiFetch("/auth/register", {
        method: "POST",
        body: payload,
        auth: false,
    });
}

export function login(payload) {
    return apiFetch("/auth/login", {
        method: "POST",
        body: payload,
        auth: false,
    });
}

export function getMe() {
    return apiFetch("/auth/me");
}