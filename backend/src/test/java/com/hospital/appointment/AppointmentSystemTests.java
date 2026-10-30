package com.hospital.appointment;

import com.hospital.appointment.dto.*;
import com.hospital.appointment.model.*;
import com.hospital.appointment.repository.*;
import com.hospital.appointment.security.UserDetailsImpl;
import com.hospital.appointment.service.AppointmentService;
import com.hospital.appointment.service.AvailabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = "spring.data.mongodb.uri=mongodb://localhost:27017/hospital_test_db")
class AppointmentSystemTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testPatient;
    private User testDoctorUser;
    private DoctorProfile testDoctorProfile;
    private Department testDept;

    @BeforeEach
    void setUp() {
        appointmentRepository.deleteAll();
        availabilityRepository.deleteAll();
        doctorProfileRepository.deleteAll();
        userRepository.deleteAll();
        departmentRepository.deleteAll();

        // 1. Setup Department
        testDept = departmentRepository.save(new Department("Cardiology", "Heart Care", "Heart"));

        // 2. Setup Patient
        testPatient = new User("Jane Doe", "jane@example.com", passwordEncoder.encode("password123"), "+1234567890", Role.PATIENT);
        testPatient = userRepository.save(testPatient);

        // 3. Setup Doctor
        testDoctorUser = new User("Dr. Robert Smith", "robert@hospital.com", passwordEncoder.encode("password123"), "+1987654321", Role.DOCTOR);
        testDoctorUser = userRepository.save(testDoctorUser);

        testDoctorProfile = new DoctorProfile(testDoctorUser.getId(), testDept.getId(), "Interventional Cardiology", "MD, FACC", 30, BigDecimal.valueOf(100.0));
        testDoctorProfile = doctorProfileRepository.save(testDoctorProfile);

        // 4. Setup Doctor Availability for all 7 days of the week 09:00 - 17:00
        for (DayOfWeek day : DayOfWeek.values()) {
            Availability avail = new Availability(testDoctorProfile.getId(), day, LocalTime.of(9, 0), LocalTime.of(17, 0), 30);
            availabilityRepository.save(avail);
        }
    }

    @Test
    @DisplayName("Should generate discrete slots for doctor according to schedule")
    void testGetAvailableSlots() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<TimeSlotDto> slots = availabilityService.getAvailableSlots(testDoctorProfile.getId(), tomorrow);

        assertNotNull(slots);
        assertFalse(slots.isEmpty());
        // 9:00 to 17:00 with 30-min slots = 16 slots
        assertEquals(16, slots.size());
        assertTrue(slots.stream().allMatch(TimeSlotDto::isAvailable));
    }

    @Test
    @DisplayName("Should book appointment and reserve slot")
    void testBookAppointmentSuccess() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDateTime slotStart = tomorrow.atTime(10, 0);

        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(testDoctorProfile.getId());
        request.setDepartmentId(testDept.getId());
        request.setStartDateTime(slotStart);
        request.setReasonForVisit("Annual Heart Checkup");

        UserDetailsImpl patientDetails = UserDetailsImpl.build(testPatient);

        AppointmentResponse response = appointmentService.bookAppointment(request, patientDetails);

        assertNotNull(response);
        assertEquals(slotStart, response.getStartDateTime());
        assertEquals(AppointmentStatus.CONFIRMED, response.getStatus());
        assertEquals("Jane Doe", response.getPatientName());
        assertEquals("Dr. Robert Smith", response.getDoctorName());

        // Verify slot is now marked as unavailable/Booked
        List<TimeSlotDto> slots = availabilityService.getAvailableSlots(testDoctorProfile.getId(), tomorrow);
        TimeSlotDto bookedSlot = slots.stream()
                .filter(s -> s.getStartDateTime().equals(slotStart))
                .findFirst()
                .orElse(null);

        assertNotNull(bookedSlot);
        assertFalse(bookedSlot.isAvailable());
        assertEquals("Booked", bookedSlot.getReasonIfNotAvailable());
    }

    @Test
    @DisplayName("Should prevent double booking for identical slot (concurrency / conflict safety)")
    void testPreventDoubleBooking() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDateTime slotStart = tomorrow.atTime(11, 0);

        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(testDoctorProfile.getId());
        request.setDepartmentId(testDept.getId());
        request.setStartDateTime(slotStart);
        request.setReasonForVisit("First Consultation");

        UserDetailsImpl patientDetails = UserDetailsImpl.build(testPatient);

        // First booking succeeds
        appointmentService.bookAppointment(request, patientDetails);

        // Create second patient
        User secondPatient = userRepository.save(new User("John Smith", "john@example.com", "pass", "+11223344", Role.PATIENT));
        UserDetailsImpl secondDetails = UserDetailsImpl.build(secondPatient);

        // Second booking attempt on exact same slot MUST throw ConflictException
        assertThrows(Exception.class, () -> {
            appointmentService.bookAppointment(request, secondDetails);
        });
    }

    @Test
    @DisplayName("Should release slot when appointment is cancelled")
    void testCancelReleasesSlot() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDateTime slotStart = tomorrow.atTime(14, 0);

        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(testDoctorProfile.getId());
        request.setDepartmentId(testDept.getId());
        request.setStartDateTime(slotStart);
        request.setReasonForVisit("Initial visit");

        UserDetailsImpl patientDetails = UserDetailsImpl.build(testPatient);

        AppointmentResponse booked = appointmentService.bookAppointment(request, patientDetails);
        assertEquals(AppointmentStatus.CONFIRMED, booked.getStatus());

        // Cancel
        AppointmentResponse cancelled = appointmentService.cancelAppointment(
                booked.getId(), new CancelRequest("Schedule conflict"), patientDetails
        );
        assertEquals(AppointmentStatus.CANCELLED, cancelled.getStatus());

        // Verify slot is available again
        List<TimeSlotDto> slots = availabilityService.getAvailableSlots(testDoctorProfile.getId(), tomorrow);
        TimeSlotDto releasedSlot = slots.stream()
                .filter(s -> s.getStartDateTime().equals(slotStart))
                .findFirst()
                .orElse(null);

        assertNotNull(releasedSlot);
        assertTrue(releasedSlot.isAvailable());
    }
}
