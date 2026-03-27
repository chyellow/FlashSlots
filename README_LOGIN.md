# FlashSlots — Auth System

This document covers the login/registration system added to FlashSlots, including all files created or modified, how the system works, and how to use it going forward.

---

## How It Works

The auth system uses **JWT (JSON Web Token)** based authentication:

1. User registers or logs in → server verifies credentials → issues a signed JWT
2. Frontend stores the JWT in `localStorage`
3. Every protected request sends the token in the `Authorization: Bearer <token>` header
4. Backend validates the token and identifies the user on each request

Two account roles are supported: **CLIENT** (books appointments) and **BUSINESS** (posts appointments). Role is chosen at registration and enforced on both frontend and backend.

---

## Files Created

### Backend

| File | Purpose |
|------|---------|
| `services/api/app/core/security.py` | Password hashing (bcrypt) and JWT creation/verification |
| `services/api/app/core/dependencies.py` | `get_current_user`, `require_client`, `require_business` FastAPI dependencies |
| `services/api/app/schemas/auth.py` | Pydantic schemas for register, login, and token responses |
| `services/api/app/api/v1/routes/auth.py` | Auth route handlers: `/register`, `/login`, `/me` |
| `services/api/app/db/registry.py` | Central model registry — imports all models so SQLAlchemy can resolve relationships |

### Frontend

| File | Purpose |
|------|---------|
| `apps/web/src/lib/auth.js` | Token storage helpers and API calls for login/register |
| `apps/web/src/views/LoginView.jsx` | Login form UI |
| `apps/web/src/views/RegisterView.jsx` | Register form UI with CLIENT/BUSINESS role selector |
| `apps/web/src/components/ProtectedRoute.jsx` | Route wrapper that redirects unauthenticated or wrong-role users |

---

## Files Modified

### Backend

| File | What Changed |
|------|-------------|
| `services/api/requirements.txt` | Added `passlib[bcrypt]`, `python-jose[cryptography]`, `pydantic[email]`, `bcrypt==4.0.1` |
| `services/api/app/api/v1/router.py` | Registered the auth router with `/auth` prefix |
| `services/api/app/main.py` | Added `import app.db.registry` to load all models at startup |
| `services/api/app/db/base.py` | Cleaned up to only contain the `Base` declarative class |
| `services/api/app/models/account.py` | Fixed import paths, `Base` capitalization, added `foreign_keys` on reservation relationships |
| `services/api/app/models/profile.py` | Fixed import paths, added missing `account` back-reference relationship |
| `services/api/app/models/business.py` | Fixed import paths, `Base` capitalization, fixed `back_populates` on reviews relationship |
| `services/api/app/models/opening.py` | Fixed import paths, `Base` capitalization |
| `services/api/app/models/reservation.py` | Fixed import paths, `Base` capitalization, fixed ambiguous `foreign_keys` |
| `services/api/app/models/notification.py` | Fixed import paths, `Base` capitalization |
| `services/api/app/models/review.py` | Fixed import paths, `Base` capitalization |
| `.env` | Added `JWT_SECRET_KEY` |
| `.env.example` | Added `JWT_SECRET_KEY` |

### Frontend

| File | What Changed |
|------|-------------|
| `apps/web/src/App.jsx` | Added login, register, and protected routes |

---

## API Endpoints

### `POST /api/v1/auth/register`
Creates a new account and profile, returns a JWT.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "CLIENT",
  "display_name": "Your Name"
}
```

**Response:**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "role": "CLIENT",
  "account_id": 1
}
```

---

### `POST /api/v1/auth/login`
Verifies credentials and returns a JWT.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same shape as register.

---

### `GET /api/v1/auth/me`
Returns the current authenticated user's info. Requires a valid Bearer token.

**Response:**
```json
{
  "account_id": 1,
  "email": "user@example.com",
  "role": "CLIENT",
  "status": "ACTIVE"
}
```

---

## Protecting Routes

### Backend

Use the dependencies from `app/core/dependencies.py` on any route:

```python
from app.core.dependencies import get_current_user, require_client, require_business

# Any logged-in user
@router.get("/me")
def get_me(current_user: Account = Depends(get_current_user)):
    ...

# CLIENT only
@router.post("/reservations")
def book(current_user: Account = Depends(require_client)):
    ...

# BUSINESS only
@router.post("/openings")
def post_opening(current_user: Account = Depends(require_business)):
    ...
```

### Frontend

Wrap any route in `ProtectedRoute` inside `App.jsx`:

```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

<Route path="/FlashSlots/client" element={
  <ProtectedRoute requiredRole="CLIENT">
    <ClientView />
  </ProtectedRoute>
} />
```

Leave `requiredRole` off if you just need any logged-in user, regardless of role.

---

## Making Authenticated API Calls

Use the token from localStorage when calling protected endpoints:

```javascript
import { getToken } from "@/lib/auth";

const res = await fetch("http://localhost:8000/api/v1/some-protected-route", {
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`,
  },
});
```

---

## Environment Variables

Add these to your `.env` file:

```
DATABASE_URL=postgresql://flashslots:flashslots@localhost:12345/flashslots
CORS_ORIGINS=http://localhost:5173
JWT_SECRET_KEY=replace-this-with-a-long-random-string
```

> **Important:** Never commit your real `.env` file. Always use a long, random string for `JWT_SECRET_KEY` in production.

---

## Notes

- `bcrypt` is pinned to `4.0.1` in `requirements.txt` due to a known incompatibility between newer bcrypt versions and `passlib`
- Passwords must be between 8 and 72 characters
- Emails are lowercased on both register and login
- `ADMIN` role exists in the database but is intentionally excluded from the public registration flow
- JWTs expire after 24 hours (configurable in `security.py` via `ACCESS_TOKEN_EXPIRE_MINUTES`)