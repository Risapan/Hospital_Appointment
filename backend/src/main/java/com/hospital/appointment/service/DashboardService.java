package com.hospital.appointment.service;

import com.hospital.appointment.dto.DashboardStatsDto;
import com.hospital.appointment.model.Appointment;
import com.hospital.appointment.model.AppointmentStatus;
import com.hospital.appointment.model.DoctorProfile;
import com.hospital.appointment.model.Role;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.repository.DepartmentRepository;
import com.hospital.appointment.repository.DoctorProfileRepository;
import com.hospital.appointment.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;

    public DashboardService(UserRepository userRepository,
                            DoctorProfileRepository doctorProfileRepository,
                            DepartmentRepository departmentRepository,
                            AppointmentRepository appointmentRepository) {
        this.userRepository = userRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.departmentRepository = departmentRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public DashboardStatsDto getAdminStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        stats.setTotalPatients(userRepository.countByRole(Role.PATIENT));
        stats.setTotalDoctors(doctorProfileRepository.countByActive(true));
        stats.setTotalDepartments(departmentRepository.count());

        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(LocalTime.MAX);

        stats.setTodayAppointmentsCount(appointmentRepository.countByStartDateTimeBetween(todayStart, todayEnd));

        stats.setTotalCompletedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        stats.setTotalCancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));

        // Group all appointments by status
        List<Appointment> all = appointmentRepository.findAll();
        Map<String, Long> statusMap = new HashMap<>();
        for (AppointmentStatus s : AppointmentStatus.values()) {
            statusMap.put(s.name(), 0L);
        }
        long upcoming = 0;
        LocalDateTime now = LocalDateTime.now();
        for (Appointment a : all) {
            if (a.getStatus() != null) {
                statusMap.put(a.getStatus().name(), statusMap.getOrDefault(a.getStatus().name(), 0L) + 1);
            }
            if (a.getStartDateTime() != null && a.getStartDateTime().isAfter(now) && a.getStatus() == AppointmentStatus.CONFIRMED) {
                upcoming++;
            }
        }

        stats.setUpcomingAppointmentsCount(upcoming);
        stats.setAppointmentsByStatus(statusMap);

        return stats;
    }
}
