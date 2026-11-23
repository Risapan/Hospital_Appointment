package com.hospital.appointment.bdd;

import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.response.Response;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.util.Map;

import static com.hospital.appointment.api.ApiTestSupport.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;

public class AppointmentSteps {

    @LocalServerPort int port;

    private String patientToken;
    private Map<String, String> slot;
    private Map<String, String> doctorB;
    private String appointmentId;
    private Response response;

    @Before
    public void connect() {
        usePort(port);
    }

    // ---------- book_appointment.feature ----------

    @Given("a registered patient is logged in")
    public void aRegisteredPatientIsLoggedIn() {
        patientToken = registerPatient("Bdd Patient");
    }

    @Given("a doctor has a free slot in the next two weeks")
    public void aDoctorHasAFreeSlot() {
        slot = doctorWithFreeSlot(0, 0);
    }

    @Given("another patient has already booked that slot")
    public void anotherPatientBookedThatSlot() {
        as(registerPatient("Bdd Other")).body(bookingBody(slot.get("doctorId"), slot.get("slot")))
                .post("/appointments").then().statusCode(201);
    }

    @Given("the patient has booked that slot")
    @When("the patient books that slot")
    public void thePatientBooksThatSlot() {
        response = as(patientToken).body(bookingBody(slot.get("doctorId"), slot.get("slot"))).post("/appointments");
        if (response.statusCode() == 201) {
            appointmentId = response.path("id");
        }
    }

    @Then("the booking is accepted with status {string}")
    public void theBookingIsAccepted(String status) {
        response.then().statusCode(201).body("status", equalTo(status));
    }

    @Then("the booking is rejected with HTTP status {int}")
    public void theBookingIsRejected(int code) {
        assertThat(response.statusCode()).isEqualTo(code);
    }

    @Then("the slot is shown as {string} to everyone else")
    public void theSlotIsShownAs(String reason) {
        json().queryParam("date", slot.get("date")).get("/doctors/" + slot.get("doctorId") + "/availability")
                .then().body("find { it.startDateTime == '" + slot.get("slot") + "' }.reasonIfNotAvailable", equalTo(reason));
    }

    @Then("the appointment is listed in the patient's appointments")
    public void listedInMyAppointments() {
        as(patientToken).get("/appointments/my").then().statusCode(200).body("id", hasItem(appointmentId));
    }

    @When("the patient cancels the appointment")
    public void thePatientCancels() {
        as(patientToken).body(Map.of("reason", "BDD cancel")).patch("/appointments/" + appointmentId + "/cancel")
                .then().statusCode(200).body("status", equalTo("CANCELLED"));
    }

    @Then("another patient can book the same slot")
    public void anotherPatientCanBook() {
        as(registerPatient("Bdd Rebook")).body(bookingBody(slot.get("doctorId"), slot.get("slot")))
                .post("/appointments").then().statusCode(201);
    }

    // ---------- doctor_access.feature ----------

    @Given("a patient has an appointment with doctor A")
    public void aPatientHasAnAppointmentWithDoctorA() {
        slot = doctorWithFreeSlot(0, 0);
        doctorB = doctorWithFreeSlot(1, 0);
        appointmentId = as(registerPatient("Bdd Access")).body(bookingBody(slot.get("doctorId"), slot.get("slot")))
                .post("/appointments").then().statusCode(201).extract().path("id");
    }

    @When("{word} {word} sets the appointment status to {string}")
    public void someoneSetsTheStatus(String article, String who, String status) {
        String token = switch (article + " " + who) {
            case "doctor A" -> login(slot.get("email"), DOCTOR_PW);
            case "doctor B" -> login(doctorB.get("email"), DOCTOR_PW);
            case "an admin" -> login(ADMIN, ADMIN_PW);
            default -> throw new IllegalArgumentException("Unknown actor: " + article + " " + who);
        };
        response = as(token).body(Map.of("status", status)).patch("/doctor/appointments/" + appointmentId + "/status");
    }

    @Then("the response status is {int}")
    public void theResponseStatusIs(int code) {
        assertThat(response.statusCode()).isEqualTo(code);
    }
}
