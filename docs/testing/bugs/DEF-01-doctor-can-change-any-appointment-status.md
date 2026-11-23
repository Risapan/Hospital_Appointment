# DEF-01: Any doctor can change the status of another doctor's appointment

| Field | Value |
|---|---|
| Severity | High (security: OWASP A01 Broken Access Control) |
| Priority | P1 |
| Component | Backend: `AppointmentService.updateStatus`, `PATCH /api/doctor/appointments/{id}/status` |
| Found by | Exploratory API probe; confirmed with REST Assured (API-15) and Cucumber (`doctor_access.feature`) |
| Environment | macOS, Java 21, Spring Boot 3.3.4, MongoDB 7, QA DB `hospital_qa_db` |
| Status | **Closed** (fixed and verified) |

## Steps to reproduce
1. Patient books a slot with Doctor A (Prof. V. Thirukumar).
2. Log in as Doctor B (`murugamoorthy.m@hospital.lk` / `doctor123`).
3. `PATCH /api/doctor/appointments/{id}/status` with body `{"status":"NO_SHOW"}`.

## Expected
HTTP 403. Only Doctor A (or an admin) may change the status.

## Actual (before fix)
HTTP 200. The appointment became `NO_SHOW` and the patient was notified.

## Root cause analysis (5 Whys)
1. Why did the request succeed? `updateStatus()` never checked who owns the appointment.
2. Why no check? Only the URL rule `hasAnyRole('DOCTOR','ADMIN')` was relied on. That checks the **role**, not **ownership**.
3. Why was ownership missed here? `getAppointmentById` and `cancelAppointment` each had their own copied-in check. `updateStatus` was written later without one.
4. Why wasn't it caught? There were no tests for authorisation across two users with the same role.
5. Root cause: authorisation logic was duplicated per method instead of centralised, and no negative-path security tests existed.

## Fix
Added `requireDoctorOwnsAppointment()` in `AppointmentService` and called it from `updateStatus()` and `rescheduleAppointment()`.

## Lifecycle
| State | Evidence |
|---|---|
| New | Probe: `Doctor B sets Doctor A's appointment to NO_SHOW -> HTTP 200` |
| Assigned | Backend developer |
| Fixed | `AppointmentService.requireDoctorOwnsAppointment()` |
| Verified | Probe re-run: `-> HTTP 403 You can only update the status of your own appointments`; unit tests `Regression.otherDoctorCannotUpdateStatus`, API-15 and the Cucumber outline pass |
| Closed | Full suite: 94/94 tests passing |
