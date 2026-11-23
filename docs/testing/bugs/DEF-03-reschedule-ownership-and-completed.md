# DEF-03: A doctor can reschedule another doctor's appointment, including completed ones

| Field | Value |
|---|---|
| Severity | High (OWASP A01 + data integrity) |
| Component | `AppointmentService.rescheduleAppointment`, `PATCH /api/appointments/{id}/reschedule` |
| Status | **Closed** |

## Steps
1. Appointment with Doctor A is marked `COMPLETED`.
2. Doctor B sends a reschedule request for it to a free slot.

## Expected
400 for a completed appointment, and 403 for a doctor who doesn't own it.

## Actual (before fix)
HTTP 200, status reset to `CONFIRMED`.

## Fix
`COMPLETED`/`NO_SHOW` are rejected with 400, and the doctor ownership check was added. Verified with probe (`-> HTTP 400`), unit tests `Regression.*Reschedule*` and API-16.
