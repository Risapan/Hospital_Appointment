# Manual OWASP Top 10 checks

| # | Category | Check | Result |
|---|---|---|---|
| 1 | A01 Broken Access Control | Patient calls `GET /api/admin/users` | 403, **pass** |
| 2 | A01 | Patient B views / cancels patient A's appointment | 403, **pass** |
| 3 | A01 | Doctor B updates / reschedules doctor A's appointment | 200, **fail**, so DEF-01 / DEF-03 (fixed) |
| 4 | A01 | Self-registration with `"role":"ADMIN"` | Created as PATIENT, **pass** |
| 5 | A07 Auth failures | 30 wrong passwords then the right one | All 401 then 200: **no lockout or rate limit** (open) |
| 6 | A07 | Refresh token used as Bearer token | 200, **fail**, so DEF-05 (open) |
| 7 | A02/A05 | JWT secret | Hard-coded default in `application.yml`; must be overridden by `JWT_SECRET` in production (open) |
| 8 | A05 Misconfiguration | Response headers | `X-Content-Type-Options`, `X-Frame-Options`, `Cache-Control` present; **HSTS and CSP missing** (open; add HSTS behind HTTPS) |
| 9 | A03 Injection | Bean Validation on all request DTOs; MongoDB repositories use typed queries, not string-built queries | No injection path found |
