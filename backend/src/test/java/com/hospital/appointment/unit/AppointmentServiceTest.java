package com.hospital.appointment.unit;

import com.hospital.appointment.dto.AppointmentRequest;
import com.hospital.appointment.dto.AppointmentResponse;
import com.hospital.appointment.dto.RescheduleRequest;
import com.hospital.appointment.dto.StatusUpdateRequest;
import com.hospital.appointment.dto.TimeSlotDto;
import com.hospital.appointment.exception.BadRequestException;
import com.hospital.appointment.exception.ConflictException;
import com.hospital.appointment.exception.ResourceNotFoundException;
import com.hospital.appointment.exception.UnauthorizedException;
import com.hospital.appointment.model.Appointment;
import com.hospital.appointment.model.AppointmentStatus;
import com.hospital.appointment.model.DoctorProfile;
import com.hospital.appointment.model.Hospital;
import com.hospital.appointment.model.Role;
import com.hospital.appointment.model.User;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.repository.DepartmentRepository;
import com.hospital.appointment.repository.DoctorProfileRepository;
import com.hospital.appointment.repository.HospitalRepository;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.security.UserDetailsImpl;
import com.hospital.appointment.service.AppointmentService;
import com.hospital.appointment.service.AuditService;
import com.hospital.appointment.service.AvailabilityService;
import com.hospital.appointment.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.DuplicateKeyException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests (Mockito, no database) for {@link AppointmentService}.
 * The BookAppointment group gives statement + branch coverage of bookAppointment()
 * and resolveHospital(); see the path table in report section 3.4.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AppointmentServiceTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private DoctorProfileRepository doctorProfileRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private HospitalRepository hospitalRepository;
    @Mock private UserRepository userRepository;
    @Mock private AvailabilityService availabilityService;
    @Mock private NotificationService notificationService;
    @Mock private AuditService auditService;

    @InjectMocks private AppointmentService service;

    private User patient, receptionist, doctorUser, otherDoctorUser;
    private DoctorProfile doctor, otherDoctor;
    private LocalDateTime slot;

    private static User user(String id, String name, Role role) {
        User u = new User(name, id + "@test.lk", "hash", "0770000000", role);
        u.setId(id);
        return u;
    }

    @BeforeEach
    void setUp() {
        patient = user("pat-1", "Kasun Patient", Role.PATIENT);
        receptionist = user("rec-1", "Anura Reception", Role.RECEPTIONIST);
        doctorUser = user("docuser-1", "Dr. Owner", Role.DOCTOR);
        otherDoctorUser = user("docuser-2", "Dr. Other", Role.DOCTOR);

        doctor = new DoctorProfile(doctorUser.getId(), "dept-1", "Cardiology", "MBBS", 30, BigDecimal.TEN);
        doctor.setId("doc-1");
        doctor.setHospitalIds(new ArrayList<>(List.of("hosp-1")));
        otherDoctor = new DoctorProfile(otherDoctorUser.getId(), "dept-2", "Neurology", "MBBS", 30, BigDecimal.TEN);
        otherDoctor.setId("doc-2");

        slot = LocalDate.now().plusDays(3).atTime(10, 0);

        when(userRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
        when(userRepository.findById(doctorUser.getId())).thenReturn(Optional.of(doctorUser));
        when(doctorProfileRepository.findById("doc-1")).thenReturn(Optional.of(doctor));
        when(doctorProfileRepository.findByUserId(doctorUser.getId())).thenReturn(Optional.of(doctor));
        when(doctorProfileRepository.findByUserId(otherDoctorUser.getId())).thenReturn(Optional.of(otherDoctor));
        when(availabilityService.getAvailableSlots(eq("doc-1"), any()))
                .thenReturn(List.of(new TimeSlotDto(slot, slot.plusMinutes(30), true)));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> {
            Appointment a = inv.getArgument(0);
            if (a.getId() == null) a.setId("apt-1");
            return a;
        });
    }

    private AppointmentRequest request() {
        AppointmentRequest r = new AppointmentRequest();
        r.setDoctorId("doc-1");
        r.setStartDateTime(slot);
        r.setReasonForVisit("Chest pain follow-up");
        return r;
    }

    private Appointment existing(AppointmentStatus status) {
        Appointment a = new Appointment(patient.getId(), "doc-1", "dept-1", slot, slot.plusMinutes(30), "visit");
        a.setId("apt-9");
        a.setStatus(status);
        when(appointmentRepository.findById("apt-9")).thenReturn(Optional.of(a));
        return a;
    }

    @Nested
    @DisplayName("bookAppointment")
    class BookAppointment {

        @Test
        @DisplayName("UT-01 patient books a free slot -> CONFIRMED, doctor's only hospital used, 2 notifications")
        void patientBooksFreeSlot() {
            AppointmentResponse res = service.bookAppointment(request(), UserDetailsImpl.build(patient));

            assertThat(res.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
            assertThat(res.getPatientId()).isEqualTo("pat-1");
            assertThat(res.getDepartmentId()).isEqualTo("dept-1");       // fallback to doctor's department
            assertThat(res.getEndDateTime()).isEqualTo(slot.plusMinutes(30));
            assertThat(res.getHospitalId()).isEqualTo("hosp-1");
            verify(notificationService, org.mockito.Mockito.times(2))
                    .createNotification(anyString(), anyString(), anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("UT-02 receptionist books for a patient id")
        void receptionistBooksForPatient() {
            AppointmentRequest r = request();
            r.setPatientId(patient.getId());
            r.setDepartmentId("dept-x");

            AppointmentResponse res = service.bookAppointment(r, UserDetailsImpl.build(receptionist));

            assertThat(res.getPatientId()).isEqualTo("pat-1");
            assertThat(res.getDepartmentId()).isEqualTo("dept-x");      // explicit department kept
        }

        @Test
        @DisplayName("UT-03 staff booking without patient id -> 400")
        void staffWithoutPatientId() {
            assertThatThrownBy(() -> service.bookAppointment(request(), UserDetailsImpl.build(receptionist)))
                    .isInstanceOf(BadRequestException.class).hasMessageContaining("Patient ID is required");
        }

        @Test
        @DisplayName("UT-04 doctor cannot book -> 403")
        void doctorCannotBook() {
            assertThatThrownBy(() -> service.bookAppointment(request(), UserDetailsImpl.build(doctorUser)))
                    .isInstanceOf(UnauthorizedException.class);
        }

        @Test
        @DisplayName("UT-05 unknown patient -> 404")
        void unknownPatient() {
            AppointmentRequest r = request();
            r.setPatientId("ghost");
            assertThatThrownBy(() -> service.bookAppointment(r, UserDetailsImpl.build(receptionist)))
                    .isInstanceOf(ResourceNotFoundException.class).hasMessageContaining("Patient");
        }

        @Test
        @DisplayName("UT-06 unknown doctor -> 404")
        void unknownDoctor() {
            AppointmentRequest r = request();
            r.setDoctorId("nobody");
            assertThatThrownBy(() -> service.bookAppointment(r, UserDetailsImpl.build(patient)))
                    .isInstanceOf(ResourceNotFoundException.class).hasMessageContaining("Doctor");
        }

        @Test
        @DisplayName("UT-07 inactive doctor -> 400")
        void inactiveDoctor() {
            doctor.setActive(false);
            assertThatThrownBy(() -> service.bookAppointment(request(), UserDetailsImpl.build(patient)))
                    .isInstanceOf(BadRequestException.class).hasMessageContaining("inactive");
        }

        @Test
        @DisplayName("UT-08 start time in the past -> 400")
        void pastStart() {
            AppointmentRequest r = request();
            r.setStartDateTime(LocalDateTime.now().minusMinutes(1));
            assertThatThrownBy(() -> service.bookAppointment(r, UserDetailsImpl.build(patient)))
                    .isInstanceOf(BadRequestException.class).hasMessageContaining("past");
        }

        @Test
        @DisplayName("UT-09 slot not offered / already taken -> 409, nothing saved")
        void slotNotAvailable() {
            when(availabilityService.getAvailableSlots(eq("doc-1"), any()))
                    .thenReturn(List.of(new TimeSlotDto(slot, slot.plusMinutes(30), false, "Booked")));
            assertThatThrownBy(() -> service.bookAppointment(request(), UserDetailsImpl.build(patient)))
                    .isInstanceOf(ConflictException.class);
            verify(appointmentRepository, never()).save(any());
        }

        @Test
        @DisplayName("UT-10 race: unique index rejects the save -> 409")
        void duplicateKeyOnSave() {
            when(appointmentRepository.save(any(Appointment.class))).thenThrow(new DuplicateKeyException("dup"));
            assertThatThrownBy(() -> service.bookAppointment(request(), UserDetailsImpl.build(patient)))
                    .isInstanceOf(ConflictException.class).hasMessageContaining("just reserved");
        }

        @Test
        @DisplayName("UT-11 no hospital chosen and doctor works at 2 hospitals -> 400")
        void hospitalRequiredWhenAmbiguous() {
            doctor.setHospitalIds(new ArrayList<>(List.of("hosp-1", "hosp-2")));
            assertThatThrownBy(() -> service.bookAppointment(request(), UserDetailsImpl.build(patient)))
                    .isInstanceOf(BadRequestException.class).hasMessageContaining("choose the hospital");
        }

        @Test
        @DisplayName("UT-12 chosen hospital is inactive -> 400")
        void inactiveHospital() {
            Hospital h = new Hospital("Closed", "Hospital", "Private", "addr", "city");
            h.setId("hosp-9");
            h.setActive(false);
            when(hospitalRepository.findById("hosp-9")).thenReturn(Optional.of(h));
            AppointmentRequest r = request();
            r.setHospitalId("hosp-9");
            assertThatThrownBy(() -> service.bookAppointment(r, UserDetailsImpl.build(patient)))
                    .isInstanceOf(BadRequestException.class).hasMessageContaining("not taking bookings");
        }

        @Test
        @DisplayName("UT-13 chosen hospital does not exist -> 400")
        void unknownHospital() {
            AppointmentRequest r = request();
            r.setHospitalId("missing");
            assertThatThrownBy(() -> service.bookAppointment(r, UserDetailsImpl.build(patient)))
                    .isInstanceOf(BadRequestException.class).hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("Regression tests for fixed defects")
    class Regression {

        @Test
        @DisplayName("DEF-01 a doctor cannot change the status of another doctor's appointment")
        void otherDoctorCannotUpdateStatus() {
            existing(AppointmentStatus.CONFIRMED);
            StatusUpdateRequest req = new StatusUpdateRequest();
            req.setStatus(AppointmentStatus.NO_SHOW);

            assertThatThrownBy(() -> service.updateStatus("apt-9", req, UserDetailsImpl.build(otherDoctorUser)))
                    .isInstanceOf(UnauthorizedException.class);
            verify(appointmentRepository, never()).save(any());
        }

        @Test
        @DisplayName("DEF-01 the owning doctor can still change the status")
        void owningDoctorCanUpdateStatus() {
            existing(AppointmentStatus.CONFIRMED);
            StatusUpdateRequest req = new StatusUpdateRequest();
            req.setStatus(AppointmentStatus.COMPLETED);

            assertThat(service.updateStatus("apt-9", req, UserDetailsImpl.build(doctorUser)).getStatus())
                    .isEqualTo(AppointmentStatus.COMPLETED);
        }

        @Test
        @DisplayName("DEF-03 a doctor cannot reschedule another doctor's appointment")
        void otherDoctorCannotReschedule() {
            existing(AppointmentStatus.CONFIRMED);
            RescheduleRequest req = new RescheduleRequest();
            req.setNewStartDateTime(slot);

            assertThatThrownBy(() -> service.rescheduleAppointment("apt-9", req, UserDetailsImpl.build(otherDoctorUser)))
                    .isInstanceOf(UnauthorizedException.class);
        }

        @Test
        @DisplayName("DEF-03 a COMPLETED appointment cannot be rescheduled")
        void completedCannotBeRescheduled() {
            existing(AppointmentStatus.COMPLETED);
            RescheduleRequest req = new RescheduleRequest();
            req.setNewStartDateTime(slot);

            assertThatThrownBy(() -> service.rescheduleAppointment("apt-9", req, UserDetailsImpl.build(patient)))
                    .isInstanceOf(BadRequestException.class).hasMessageContaining("cannot be rescheduled");
        }

        @Test
        @DisplayName("DEF-03 the patient can still reschedule a CONFIRMED appointment to a free slot")
        void patientCanReschedule() {
            existing(AppointmentStatus.CONFIRMED);
            RescheduleRequest req = new RescheduleRequest();
            req.setNewStartDateTime(slot);

            assertThat(service.rescheduleAppointment("apt-9", req, UserDetailsImpl.build(patient)).getStartDateTime())
                    .isEqualTo(slot);
        }
    }
}
