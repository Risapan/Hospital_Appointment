# DEF-02: Appointment status can move in any direction

| Field | Value |
|---|---|
| Severity | Medium (data integrity) |
| Priority | P2 |
| Component | `AppointmentService.updateStatus` |
| Status | **Open** |

## Steps
1. Admin sets an appointment to `COMPLETED` (HTTP 200).
2. Admin then sets the same appointment to `PENDING` (HTTP 200).

## Expected
Only valid transitions are allowed, e.g. PENDING→CONFIRMED→COMPLETED/NO_SHOW, or →CANCELLED. A finished visit cannot be reopened.

## Actual
Any status can be set at any time.

## Suggested fix
Add an allowed-transition map (a state machine) on `AppointmentStatus` and reject other moves with 400.
