package com.hospital.appointment.api;

import com.hospital.appointment.model.User;
import com.hospital.appointment.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.util.Map;

import static com.hospital.appointment.api.ApiTestSupport.*;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/** REST Assured API tests for authentication and role-based access (decision table DT-LOGIN, report 3.3). */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = ApiTestSupport.MONGO_URI)
class AuthApiTest {

    @LocalServerPort int port;
    @Autowired UserRepository userRepository;

    @BeforeEach
    void setUp() {
        usePort(port);
    }

    @ParameterizedTest(name = "{0}")
    @DisplayName("DT-LOGIN: login decision table")
    @CsvSource({
            // rule,                                 email,                      password,          expected
            "R1 registered + correct password,       patient@hospital.lk,        patient123,        200",
            "R2 registered + wrong password,         patient@hospital.lk,        wrong-pass,        401",
            "R3 not registered,                      nobody@hospital.lk,         patient123,        401",
            "R4 email in upper case + correct,       PATIENT@HOSPITAL.LK,        patient123,        200",
            "R5 invalid email format,                patient-at-hospital,        patient123,        400",
            "R6 blank password,                      patient@hospital.lk,        '',                400",
    })
    void loginDecisionTable(String rule, String email, String password, int expected) {
        json().body(Map.of("email", email, "password", password))
                .post("/auth/login").then().statusCode(expected);
    }

    @Test
    @DisplayName("DT-LOGIN R7: deactivated account with the correct password -> 401 ACCOUNT_DISABLED")
    void deactivatedAccountCannotLogIn() {
        String email = "disabled." + System.nanoTime() + "@example.com";
        json().body(Map.of("fullName", "Disabled User", "email", email, "password", "secret12", "nic", uniqueNic()))
                .post("/auth/register").then().statusCode(200);
        User u = userRepository.findByEmail(email).orElseThrow();
        u.setActive(false);
        userRepository.save(u);

        json().body(Map.of("email", email, "password", "secret12"))
                .post("/auth/login").then().statusCode(401).body("errorCode", equalTo("ACCOUNT_DISABLED"));
    }

    @Test
    @DisplayName("API-01 login response contains a token and the user's role, never the password hash")
    void loginResponseShape() {
        json().body(Map.of("email", ADMIN, "password", ADMIN_PW)).post("/auth/login")
                .then().statusCode(200)
                .body("token", not(emptyOrNullString()))
                .body("user.role", equalTo("ADMIN"))
                .body(not(containsString("passwordHash")));
    }

    @Test
    @DisplayName("API-02 self-registration asking for ADMIN still creates a PATIENT (no privilege escalation)")
    void registerCannotChooseRole() {
        String email = "escalate." + System.nanoTime() + "@example.com";
        json().body(Map.of("fullName", "Mallory", "email", email, "password", "secret12", "nic", uniqueNic(), "role", "ADMIN"))
                .post("/auth/register").then().statusCode(200).body("user.role", equalTo("PATIENT"));
    }

    @Test
    @DisplayName("API-03 registering the same email twice -> 400")
    void duplicateEmail() {
        json().body(Map.of("fullName", "Dup", "email", PATIENT, "password", "secret12", "nic", uniqueNic()))
                .post("/auth/register").then().statusCode(400).body("message", containsString("already exists"));
    }

    @Test
    @DisplayName("API-04 no token on a protected endpoint -> 401")
    void noTokenIs401() {
        json().get("/appointments/my").then().statusCode(401);
    }

    @Test
    @DisplayName("API-05 patient calling an admin endpoint -> 403")
    void patientIsForbiddenFromAdmin() {
        as(login(PATIENT, PATIENT_PW)).get("/admin/users").then().statusCode(403);
    }

    @Test
    @DisplayName("API-06 receptionist cannot reach admin endpoints, admin can")
    void roleMatrix() {
        as(login(RECEPTIONIST, RECEPTIONIST_PW)).get("/admin/users").then().statusCode(403);
        as(login(ADMIN, ADMIN_PW)).get("/admin/users").then().statusCode(200);
    }

    @Test
    @DisplayName("API-07 (regression DEF-07) refresh with a forged token -> 400, not 500")
    void forgedRefreshTokenIs400() {
        String forged = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBob3NwaXRhbC5sayJ9.c2lnbmVkLXdpdGgtdGhlLXdyb25nLWtleS0xMjM0NTY3";
        given().contentType("application/json").body(Map.of("refreshToken", forged))
                .post("/auth/refresh").then().statusCode(400);
    }

    @Test
    @DisplayName("API-08 public catalogue endpoints work without login")
    void publicEndpoints() {
        json().get("/departments").then().statusCode(200).body("size()", greaterThan(0));
        json().get("/doctors").then().statusCode(200).body("size()", greaterThan(0));
    }
}
