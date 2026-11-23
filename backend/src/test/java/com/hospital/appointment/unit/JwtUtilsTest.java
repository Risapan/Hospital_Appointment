package com.hospital.appointment.unit;

import com.hospital.appointment.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

/** TDD-style unit tests for token creation and validation. */
class JwtUtilsTest {

    private static final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final String OTHER_SECRET = "5A7134743777217A25432A462D4A614E645267556B58703273357638792F423F";

    private JwtUtils jwt;

    private static JwtUtils withSecret(String secret, long accessMs) {
        JwtUtils j = new JwtUtils();
        ReflectionTestUtils.setField(j, "jwtSecret", secret);
        ReflectionTestUtils.setField(j, "jwtExpirationMs", accessMs);
        ReflectionTestUtils.setField(j, "jwtRefreshExpirationMs", 60_000L);
        return j;
    }

    @BeforeEach
    void setUp() {
        jwt = withSecret(SECRET, 60_000L);
    }

    @Test
    @DisplayName("JWT-01 a fresh access token validates and carries the email as subject")
    void validTokenRoundTrip() {
        String token = jwt.generateAccessToken("patient@hospital.lk", "PATIENT", "u1");
        assertThat(jwt.validateJwtToken(token)).isTrue();
        assertThat(jwt.getUserNameFromJwtToken(token)).isEqualTo("patient@hospital.lk");
    }

    @Test
    @DisplayName("JWT-02 an expired token is rejected")
    void expiredTokenRejected() {
        String token = withSecret(SECRET, -1_000L).generateAccessToken("a@b.lk", "PATIENT", "u1");
        assertThat(jwt.validateJwtToken(token)).isFalse();
    }

    @Test
    @DisplayName("JWT-03 a malformed token is rejected")
    void malformedTokenRejected() {
        assertThat(jwt.validateJwtToken("not.a.jwt")).isFalse();
    }

    @Test
    @DisplayName("JWT-04 (regression DEF-07) a token signed with another key returns false instead of throwing")
    void foreignSignatureRejected() {
        String forged = withSecret(OTHER_SECRET, 60_000L).generateAccessToken("admin@hospital.lk", "ADMIN", "x");
        assertThat(jwt.validateJwtToken(forged)).isFalse();
    }

    @Test
    @DisplayName("JWT-05 (documents DEF-05) refresh and access tokens are indistinguishable")
    void refreshTokenLooksLikeAccessToken() {
        String refresh = jwt.generateRefreshToken("patient@hospital.lk");
        // Desired: false. Actual: true, so a 7-day refresh token works as a Bearer access token.
        assertThat(jwt.validateJwtToken(refresh)).isTrue();
    }
}
