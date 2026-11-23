Feature: Doctors only manage their own appointments
  Regression feature for defect DEF-01 (broken access control on status updates)

  Background:
    Given a patient has an appointment with doctor A

  Scenario Outline: Updating the status of the appointment
    When <who> sets the appointment status to "<status>"
    Then the response status is <code>

    Examples:
      | who      | status    | code |
      | doctor B | NO_SHOW   | 403  |
      | doctor A | COMPLETED | 200  |
      | an admin | COMPLETED | 200  |
