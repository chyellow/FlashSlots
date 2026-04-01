const TOKEN_KEY = "flashslots_access_token";
const USER_KEY = "flashslots_auth_user";

export function saveAuth(authResponse) {
  localStorage.setItem(TOKEN_KEY, authResponse.access_token);
  localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        account_id: authResponse.account_id,
        email: authResponse.email,
        role: authResponse.role,
      })
  );
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}