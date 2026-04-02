import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest, register as registerRequest, getMe } from "../api/auth";
import { clearAuth, getStoredUser, saveAuth } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getStoredUser());
    const [loading, setLoading] = useState(false);

    async function registerAction(payload) {
        setLoading(true);
        try {
            const auth = await registerRequest(payload);
            saveAuth(auth);
            setUser({
                account_id: auth.account_id,
                email: auth.email,
                role: auth.role,
            });
            return auth;
        } finally {
            setLoading(false);
        }
    }

    async function loginAction(payload) {
        setLoading(true);
        try {
            const auth = await loginRequest(payload);
            saveAuth(auth);
            setUser({
                account_id: auth.account_id,
                email: auth.email,
                role: auth.role,
            });
            return auth;
        } finally {
            setLoading(false);
        }
    }

    async function refreshMe() {
        try {
            const me = await getMe();
            setUser(me);
            return me;
        } catch (err) {
            clearAuth();
            setUser(null);
            throw err;
        }
    }

    function logout() {
        clearAuth();
        setUser(null);
    }

    useEffect(() => {
        if (user) {
            refreshMe().catch(() => {});
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            registerAction,
            loginAction,
            refreshMe,
            logout,
            isAuthenticated: !!user,
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }
    return ctx;
}