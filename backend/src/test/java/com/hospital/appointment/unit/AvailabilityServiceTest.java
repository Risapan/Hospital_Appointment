package com.hospital.appointment.unit;

import com.hospital.appointment.dto.TimeSlotDto;
import com.hospital.appointment.model.Appointment;
import com.hospital.appointment.model.AppointmentStatus;
import com.hospital.appointment.model.Availability;
import com.hospital.appointment.model.BlockedPeriod;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.repository.AvailabilityRepository;
import com.hospital.appointment.repository.BlockedPeriodRepository;
import com.hospital.appointment.repository.DoctorProfileRepository;
import com.hospital.appointment.service.AvailabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * White-box tests for {@link AvailabilityService#getAvailableSlots}.
 * Each test targets one branch of the control-flow graph (see report section 3.4):
 *   B1 no schedule for the day    B2 loop condition (strictly before / exactly equal / exit)
 *   B3 slot in the past           B4 slot blocked by doctor     B5 slot booked     B6 slot free
 */
@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    private static final String DOCTOR_ID = "doc-1";

    @Mock private AvailabilityRepository availabilityRepository;
    @Mock private BlockedPeriodRepository blockedPeriodRepository;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private DoctorProfileRepository doctorProfileRepository;

    @InjectMocks private AvailabilityService service;

    private LocalDate futureMonday;

    @BeforeEach
    void setUp() {
        futureMonday = LocalDate.now().plusWeeks(1).with(TemporalAdjusters.next(DayOfWeek.MONDAY));
    }

    private void scheduleFor(LocalDate day, LocalTime start, LocalTime end, int minutes) {
        Availability a = new Availability(DOCTOR_ID, day.getDayOfWeek(), start, end, minutes);
        when(availabilityRepository.findByDoctorIdAndDayOfWeekAndActive(DOCTOR_ID, day.getDayOfWeek(), true))
                .thenReturn(Optional.of(a));
    }

    @Test
    @DisplayName("WB-01 (B1 true): no schedule on that weekday returns an empty list")
    void noScheduleReturnsEmpty() {
        when(availabilityRepository.findByDoctorIdAndDayOfWeekAndActive(eq(DOCTOR_ID), any(), eq(true)))
                .thenReturn(Optional.empty());

        assertThat(service.getAvailableSlots(DOCTOR_ID, futureMonday)).isEmpty();
    }

    @Test
    @DisplayName("WB-02 (B2 strictly-before + exactly-equal, B6): 09:00-17:00 at 30 min gives 16 free slots")
    void fullDayGivesSixteenFreeSlots() {
        scheduleFor(futureMonday, LocalTime.of(9, 0), LocalTime.of(17, 0), 30);

        List<TimeSlotDto> slots = service.getAvailableSlots(DOCTOR_ID, futureMonday);

        assertThat(slots).hasSize(16).allMatch(TimeSlotDto::isAvailable);
        assertThat(slots.get(15).getEndDateTime()).isEqualTo(futureMonday.atTime(17, 0));
    }

    @Test
    @DisplayName("WB-03 (B2 exit): a trailing part-slot is not offered (09:00-10:45 at 30 min = 3 slots)")
    void partialTrailingSlotIsDropped() {
        scheduleFor(futureMonday, LocalTime.of(9, 0), LocalTime.of(10, 45), 30);

        List<TimeSlotDto> slots = service.getAvailableSlots(DOCTOR_ID, futureMonday);

        assertThat(slots).hasSize(3);
        assertThat(slots.get(2).getEndDateTime()).isEqualTo(futureMonday.atTime(10, 30));
    }

    @Test
    @DisplayName("WB-04 (BVA): window exactly one slot long gives exactly 1 slot")
    void windowEqualToOneSlot() {
        scheduleFor(futureMonday, LocalTime.of(9, 0), LocalTime.of(9, 30), 30);

        assertThat(service.getAvailableSlots(DOCTOR_ID, futureMonday)).hasSize(1);
    }

    @Test
    @DisplayName("WB-05 (BVA): window one minute shorter than a slot gives 0 slots")
    void windowShorterThanOneSlot() {
        scheduleFor(futureMonday, LocalTime.of(9, 0), LocalTime.of(9, 29), 30);

        assertThat(service.getAvailableSlots(DOCTOR_ID, futureMonday)).isEmpty();
    }

    @Test
    @DisplayName("WB-06 (B3): every slot on a past date is marked Past")
    void pastDateSlotsArePast() {
        LocalDate pastMonday = LocalDate.now().minusWeeks(1).with(TemporalAdjusters.previous(DayOfWeek.MONDAY));
        scheduleFor(pastMonday, LocalTime.of(9, 0), LocalTime.of(10, 0), 30);

        List<TimeSlotDto> slots = service.getAvailableSlots(DOCTOR_ID, pastMonday);

        assertThat(slots).hasSize(2).noneMatch(TimeSlotDto::isAvailable)
                .allMatch(s -> "Past".equals(s.getReasonIfNotAvailable()));
    }

    @Test
    @DisplayName("WB-07 (B4): a slot overlapping a blocked period is Doctor Unavailable")
    void blockedSlotIsUnavailable() {
        scheduleFor(futureMonday, LocalTime.of(9, 0), LocalTime.of(10, 30), 30);
        BlockedPeriod meeting = new BlockedPeriod(DOCTOR_ID, futureMonday.atTime(9, 30), futureMonday.atTime(10, 0), "MEETING", null);
        when(blockedPeriodRepository.findByDoctorIdAndEndDateTimeAfterAndStartDateTimeBefore(eq(DOCTOR_ID), any(), any()))
                .thenReturn(List.of(meeting));

        List<TimeSlotDto> slots = service.getAvailableSlots(DOCTOR_ID, futureMonday);

        assertThat(slots).extracting(TimeSlotDto::isAvailable).containsExactly(true, false, true);
        assertThat(slots.get(1).getReasonIfNotAvailable()).isEqualTo("Doctor Unavailable");
    }

    @Test
    @DisplayName("WB-08 (B5): a slot with a non-cancelled appointment is Booked")
    void bookedSlotIsUnavailable() {
        scheduleFor(futureMonday, LocalTime.of(9, 0), LocalTime.of(10, 0), 30);
        LocalDateTime nine = futureMonday.atTime(9, 0);
        Appointment booked = new Appointment("p1", DOCTOR_ID, "dept", nine, nine.plusMinutes(30), "check-up");
        when(appointmentRepository.findByDoctorIdAndStartDateTimeBetweenAndStatusNot(
                eq(DOCTOR_ID), any(), any(), eq(AppointmentStatus.CANCELLED))).thenReturn(List.of(booked));

        List<TimeSlotDto> slots = service.getAvailableSlots(DOCTOR_ID, futureMonday);

        assertThat(slots.get(0).isAvailable()).isFalse();
        assertThat(slots.get(0).getReasonIfNotAvailable()).isEqualTo("Booked");
        assertThat(slots.get(1).isAvailable()).isTrue();
    }

    @Test
    @DisplayName("WB-09: blocked takes priority over booked for the same slot")
    void blockedBeatsBooked() {
        scheduleFor(futureMonday, LocalTime.of(9, 0), LocalTime.of(9, 30), 30);
        LocalDateTime nine = futureMonday.atTime(9, 0);
        when(appointmentRepository.findByDoctorIdAndStartDateTimeBetweenAndStatusNot(
                eq(DOCTOR_ID), any(), any(), eq(AppointmentStatus.CANCELLED)))
                .thenReturn(List.of(new Appointment("p1", DOCTOR_ID, "d", nine, nine.plusMinutes(30), "x")));
        when(blockedPeriodRepository.findByDoctorIdAndEndDateTimeAfterAndStartDateTimeBefore(eq(DOCTOR_ID), any(), any()))
                .thenReturn(List.of(new BlockedPeriod(DOCTOR_ID, nine, nine.plusHours(1), "LEAVE", null)));

        assertThat(service.getAvailableSlots(DOCTOR_ID, futureMonday).get(0).getReasonIfNotAvailable())
                .isEqualTo("Doctor Unavailable");
    }

    @Test
    @DisplayName("WB-10 (BVA): a block ending exactly when a slot starts does not block it")
    void blockTouchingSlotEdgeDoesNotBlock() {
        scheduleFor(futureMonday, LocalTime.of(9, 0), LocalTime.of(10, 0), 30);
        when(blockedPeriodRepository.findByDoctorIdAndEndDateTimeAfterAndStartDateTimeBefore(eq(DOCTOR_ID), any(), any()))
                .thenReturn(List.of(new BlockedPeriod(DOCTOR_ID, futureMonday.atTime(8, 0), futureMonday.atTime(9, 0), "x", null)));

        assertThat(service.getAvailableSlots(DOCTOR_ID, futureMonday)).allMatch(TimeSlotDto::isAvailable);
    }
}
