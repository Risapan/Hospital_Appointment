package com.hospital.appointment.unit;

import com.hospital.appointment.dto.RegisterRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Black-box tests for the registration form, run against the same Bean Validation
 * rules the API applies (report section 3.3).
 *   EP  = Equivalence Partitioning (one representative per class)
 *   BVA = Boundary Value Analysis (min-1, min, min+1, max-1, max, max+1)
 */
class RegisterRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void init() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void close() {
        factory.close();
    }

    private static RegisterRequest valid() {
        RegisterRequest r = new RegisterRequest();
        r.setFullName("Kasun Perera");
        r.setEmail("kasun@example.com");
        r.setPassword("secret1");
        r.setNic("200012345678");
        return r;
    }

    private static boolean fieldValid(RegisterRequest r, String field) {
        Set<ConstraintViolation<RegisterRequest>> v = validator.validateProperty(r, field);
        return v.isEmpty();
    }

    @ParameterizedTest(name = "{0}: NIC \"{1}\" -> valid={2}")
    @DisplayName("EP-NIC: Sri Lankan NIC partitions")
    @CsvSource({
            "EP1 old format 9 digits + V,      991234567V,     true",
            "EP2 old format lowercase v,       991234567v,     true",
            "EP3 old format with X,            991234567X,     true",
            "EP4 new format 12 digits,         200012345678,   true",
            "EP5 9 digits no letter,           991234567,      false",
            "EP6 wrong letter (A),             991234567A,     false",
            "EP7 letters in digits,            99123A567V,     false",
            "EP8 10 digits,                    9912345678,     false",
            "EP9 letter in the middle (12),    20001234567V,   false",
    })
    void nicPartitions(String label, String nic, boolean expected) {
        RegisterRequest r = valid();
        r.setNic(nic);
        assertThat(fieldValid(r, "nic")).as(label).isEqualTo(expected);
    }

    @ParameterizedTest(name = "{0}: NIC length {1} -> valid={2}")
    @DisplayName("BVA-NIC: numeric NIC length around 12 (new format)")
    @CsvSource({
            "11 digits (max-1), 11, false",
            "12 digits (max),   12, true",
            "13 digits (max+1), 13, false",
    })
    void nicLengthBoundaries(String label, int length, boolean expected) {
        RegisterRequest r = valid();
        r.setNic("1".repeat(length));
        assertThat(fieldValid(r, "nic")).as(label).isEqualTo(expected);
    }

    @ParameterizedTest(name = "password length {0} -> valid={1}")
    @DisplayName("BVA-Password: length 6..100")
    @CsvSource({"5, false", "6, true", "7, true", "99, true", "100, true", "101, false"})
    void passwordLengthBoundaries(int length, boolean expected) {
        RegisterRequest r = valid();
        r.setPassword("a".repeat(length));
        assertThat(fieldValid(r, "password")).isEqualTo(expected);
    }

    @ParameterizedTest(name = "full name length {0} -> valid={1}")
    @DisplayName("BVA-Name: length 2..100")
    @CsvSource({"1, false", "2, true", "3, true", "99, true", "100, true", "101, false"})
    void nameLengthBoundaries(int length, boolean expected) {
        RegisterRequest r = valid();
        r.setFullName("a".repeat(length));
        assertThat(fieldValid(r, "fullName")).isEqualTo(expected);
    }

    @ParameterizedTest(name = "{0}: email \"{1}\" -> valid={2}")
    @DisplayName("EP-Email: valid vs invalid format, blank")
    @CsvSource({
            "EP1 normal address,   kasun@example.com,  true",
            "EP2 subdomain,        a.b@mail.uni.lk,    true",
            "EP3 missing @,        kasun.example.com,  false",
            "EP4 two @,            a@@example.com,     false",
            "EP5 blank,            '   ',              false",
    })
    void emailPartitions(String label, String email, boolean expected) {
        RegisterRequest r = valid();
        r.setEmail(email);
        assertThat(fieldValid(r, "email")).as(label).isEqualTo(expected);
    }
}
