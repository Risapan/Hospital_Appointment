# DEF-05: Refresh tokens work as access tokens (and the reverse)

| Field | Value |
|---|---|
| Severity | Medium (OWASP A07 Identification & Authentication Failures) |
| Component | `JwtUtils`, `AuthTokenFilter`, `POST /api/auth/refresh` |
| Status | **Open** |

## Steps
1. Log in and keep `refreshToken` (valid for 7 days).
2. Call `GET /api/appointments/my` with `Authorization: Bearer <refreshToken>`.

## Expected
401, because a refresh token should only be accepted by `/api/auth/refresh`.

## Actual
200. Separately, an access token is accepted by `/api/auth/refresh`, so a stolen access token can be renewed forever.

## Suggested fix
Add a `typ` claim (`access`/`refresh`). The filter accepts only `access`; the refresh endpoint accepts only `refresh`.
