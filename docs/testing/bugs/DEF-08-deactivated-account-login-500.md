# DEF-08: Logging in to a deactivated account returns 500 instead of 401

| Field | Value |
|---|---|
| Severity | Medium |
| Component | `UserDetailsImpl`, `GlobalExceptionHandler` |
| Found by | Decision-table test DT-LOGIN R7 (`AuthApiTest.deactivatedAccountCannotLogIn`) |
| Status | **Closed** |

## Steps
1. Deactivate a user (`active = false`).
2. Log in with the correct password.

## Expected
401 `ACCOUNT_DISABLED` ("This account has been deactivated.").

## Actual (before fix)
500. The log shows `LockedException: User account is locked`.

## Root cause analysis (fishbone summary)
- **Code:** `UserDetailsImpl.isAccountNonLocked()` and `isEnabled()` both return `active`.
- **Framework:** Spring Security's pre-authentication check tests *locked* before *disabled*, so `LockedException` is raised first.
- **Error handling:** `GlobalExceptionHandler` mapped only `DisabledException`, so `LockedException` fell through to the 500 catch-all.
- **Process:** no test covered the "inactive account" rule of the login decision table.

## Fix
Handle `LockedException` together with `DisabledException` (same 401 body). Verified: DT-LOGIN R7 passes.
