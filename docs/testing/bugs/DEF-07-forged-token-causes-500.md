# DEF-07: A token signed with the wrong key makes /api/auth/refresh return 500

| Field | Value |
|---|---|
| Severity | Medium (robustness; error leaks that verification blew up) |
| Component | `JwtUtils.validateJwtToken` |
| Status | **Closed** |

## Steps
`POST /api/auth/refresh` with `{"refreshToken":"<JWT signed with another HMAC key>"}`.

## Expected
400 `Invalid refresh token`.

## Actual (before fix)
500 `INTERNAL_SERVER_ERROR`.

## Root cause
`validateJwtToken` caught only `Malformed`, `Expired`, `Unsupported` and `IllegalArgument` exceptions. jjwt 0.12 throws `SignatureException` for a bad signature, which escaped to the global handler.

## Fix
Also catch `io.jsonwebtoken.JwtException`. Verified: probe returns HTTP 400; JWT-04 and API-07 pass.
