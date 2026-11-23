package com.hospital.appointment.api;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;

/** Shared helpers for REST Assured and Cucumber tests. Data comes from DataInitializer's seed. */
public final class ApiTestSupport {

    public static final String MONGO_URI = "spring.data.mongodb.uri=mongodb://localhost:27017/hospital_api_test_db";

    public static final String PATIENT = "patient@hospital.lk";
    public static final String PATIENT_PW = "patient123";
    public static final String ADMIN = "admin@hospital.lk";
    public static final String ADMIN_PW = "admin123";
    public static final String RECEPTIONIST = "receptionist@hospital.lk";
    public static final String RECEPTIONIST_PW = "receptionist123";
    public static final String DOCTOR_PW = "doctor123";

    private ApiTestSupport() {}

    public static void usePort(int port) {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    public static RequestSpecification json() {
        return given().contentType(ContentType.JSON).accept(ContentType.JSON);
    }

    public static RequestSpecification as(String token) {
        return json().header("Authorization", "Bearer " + token);
    }

    public static String login(String email, String password) {
        return json().body(Map.of("email", email, "password", password))
                .post("/auth/login").then().statusCode(200).extract().path("token");
    }

    /** A unique, format-valid 12-digit NIC so repeated runs never collide. */
    public static String uniqueNic() {
        long n = System.nanoTime() % 1_000_000_000_000L;
        return String.format("%012d", n);
    }

    public static String registerPatient(String name) {
        String email = name.toLowerCase().replace(' ', '.') + "." + System.nanoTime() + "@example.com";
        return json().body(Map.of("fullName", name, "email", email, "password", "secret12", "nic", uniqueNic()))
                .post("/auth/register").then().statusCode(200).extract().path("token");
    }

    @SuppressWarnings("unchecked")
    public static List<Map<String, Object>> doctors() {
        return json().get("/doctors").then().statusCode(200).extract().as(List.class);
    }

    public static String firstHospitalId() {
        return json().get("/hospitals").then().statusCode(200).extract().path("[0].id");
    }

    /** Finds a doctor with at least `minFree` free slots within two weeks. Returns {doctorId, email, slot, date}. */
    @SuppressWarnings("unchecked")
    public static Map<String, String> doctorWithFreeSlot(int skipDoctors, int slotIndex) {
        int seen = 0;
        for (Map<String, Object> d : doctors()) {
            for (int day = 1; day <= 14; day++) {
                String date = LocalDate.now().plusDays(day).toString();
                List<Map<String, Object>> slots = json().queryParam("date", date)
                        .get("/doctors/" + d.get("id") + "/availability").then().extract().as(List.class);
                List<Map<String, Object>> free = slots.stream().filter(s -> Boolean.TRUE.equals(s.get("available"))).toList();
                if (free.size() > slotIndex) {
                    if (seen++ < skipDoctors) break;
                    return Map.of("doctorId", (String) d.get("id"), "email", (String) d.get("email"),
                            "slot", (String) free.get(slotIndex).get("startDateTime"), "date", date);
                }
            }
        }
        throw new IllegalStateException("No doctor with free slots in the seeded test data");
    }

    public static Map<String, Object> bookingBody(String doctorId, String slot) {
        return Map.of("doctorId", doctorId, "startDateTime", slot,
                "reasonForVisit", "Automated test", "hospitalId", firstHospitalId());
    }
}
