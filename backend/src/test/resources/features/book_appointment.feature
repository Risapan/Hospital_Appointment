Feature: Book a doctor's appointment
  As a patient
  I want to book a free time slot with a doctor
  So that I am guaranteed to be seen at that time

  Background:
    Given a registered patient is logged in
    And a doctor has a free slot in the next two weeks

  Scenario: Patient books a free slot
    When the patient books that slot
    Then the booking is accepted with status "CONFIRMED"
    And the slot is shown as "Booked" to everyone else
    And the appointment is listed in the patient's appointments

  Scenario: Two patients try to take the same slot
    Given another patient has already booked that slot
    When the patient books that slot
    Then the booking is rejected with HTTP status 409

  Scenario: Cancelling frees the slot again
    Given the patient has booked that slot
    When the patient cancels the appointment
    Then another patient can book the same slot
