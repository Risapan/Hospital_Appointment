package com.hospital.appointment.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.time.LocalDateTime;
import java.util.Map;

import static com.hospital.appointment.api.ApiTestSupport.*;
import static org.hamcrest.Matchers.*;

/** REST Assured end-to-end tests of the booking flow through the real HTTP API. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = ApiTestSupport.MONGO_URI)
class AppointmentApiTest {

    @LocalServerPort int port;

    @BeforeEach
    void setUp() {
        usePort(port);
    }

    @Test
    @DisplayName("API-10 patient books -> 201 CONFIRMED, slot then shows Booked, appears in /my")
    void bookAndSeeIt() {
        String token = registerPatient("Booking Tester");
        Map<String, String> d = doctorWithFreeSlot(0, 0);

        String id = as(token).body(bookingBody(d.get("doctorId"), d.get("slot")))
                .post("/appointments").then().statusCode(201)
                .body("status", equalTo("CONFIRMED")).extract().path("id");

        json().queryParam("date", d.get("date")).get("/doctors/" + d.get("doctorId") + "/availability")
                .then().body("find { it.startDateTime == '" + d.get("slot") + "' }.reasonIfNotAvailable", equalTo("Booked"));
        as(token).get("/appointments/my").then().statusCode(200).body("id", hasItem(id));
    }

    @Test
    @DisplayName("API-11 second patient on the same slot -> 409")
    void doubleBookingRejected() {
        Map<String, String> d = doctorWithFreeSlot(0, 0);
        as(registerPatient("First Patient")).body(bookingBody(d.get("doctorId"), d.get("slot")))
                .post("/appointments").then().statusCode(201);
        as(registerPatient("Second Patient")).body(bookingBody(d.get("doctorId"), d.get("slot")))
                .post("/appointments").then().statusCode(409);
    }

    @Test
    @DisplayName("API-12 booking in the past -> 400")
    void pastBookingRejected() {
        Map<String, String> d = doctorWithFreeSlot(0, 0);
        String past = LocalDateTime.now().minusHours(1).withNano(0).toString();
        as(registerPatient("Past Patient")).body(bookingBody(d.get("doctorId"), past))
                .post("/appointments").then().statusCode(400);
    }

    @Test
    @DisplayName("API-13 another patient cannot view or cancel my appointment -> 403")
    void otherPatientForbidden() {
        Map<String, String> d = doctorWithFreeSlot(0, 0);
        String id = as(registerPatient("Owner Patient")).body(bookingBody(d.get("doctorId"), d.get("slot")))
                .post("/appointments").then().statusCode(201).extract().path("id");
        String intruder = registerPatient("Intruder Patient");
        as(intruder).get("/appointments/" + id).then().statusCode(403);
        as(intruder).body(Map.of("reason", "x")).patch("/appointments/" + id + "/cancel").then().statusCode(403);
    }

    @Test
    @DisplayName("API-14 cancelling releases the slot so it can be booked again")
    void cancelReleasesSlot() {
        Map<String, String> d = doctorWithFreeSlot(0, 0);
        String owner = registerPatient("Cancel Patient");
        String id = as(owner).body(bookingBody(d.get("doctorId"), d.get("slot")))
                .post("/appointments").then().statusCode(201).extract().path("id");
        as(owner).body(Map.of("reason", "Can't make it")).patch("/appointments/" + id + "/cancel")
                .then().statusCode(200).body("status", equalTo("CANCELLED"));
        as(registerPatient("Rebook Patient")).body(bookingBody(d.get("doctorId"), d.get("slot")))
                .post("/appointments").then().statusCode(201);
    }

    @Test
    @DisplayName("API-15 (regression DEF-01) another doctor cannot change the status -> 403; the owner can")
    void onlyOwningDoctorUpdatesStatus() {
        Map<String, String> a = doctorWithFreeSlot(0, 0);
        Map<String, String> b = doctorWithFreeSlot(1, 0);
        String id = as(registerPatient("Status Patient")).body(bookingBody(a.get("doctorId"), a.get("slot")))
                .post("/appointments").then().statusCode(201).extract().path("id");

        as(login(b.get("email"), DOCTOR_PW)).body(Map.of("status", "NO_SHOW"))
                .patch("/doctor/appointments/" + id + "/status").then().statusCode(403);
        as(login(a.get("email"), DOCTOR_PW)).body(Map.of("status", "COMPLETED"))
                .patch("/doctor/appointments/" + id + "/status").then().statusCode(200).body("status", equalTo("COMPLETED"));
    }

    @Test
    @DisplayName("API-16 (regression DEF-03) a COMPLETED appointment cannot be rescheduled -> 400")
    void completedCannotBeRescheduled() {
        Map<String, String> a = doctorWithFreeSlot(0, 0);
        String patient = registerPatient("Reschedule Patient");
        String id = as(patient).body(bookingBody(a.get("doctorId"), a.get("slot")))
                .post("/appointments").then().statusCode(201).extract().path("id");
        as(login(ADMIN, ADMIN_PW)).body(Map.of("status", "COMPLETED"))
                .patch("/doctor/appointments/" + id + "/status").then().statusCode(200);
        Map<String, String> later = doctorWithFreeSlot(0, 1);
        as(patient).body(Map.of("newStartDateTime", later.get("slot")))
                .patch("/appointments/" + id + "/reschedule").then().statusCode(400);
    }
}
