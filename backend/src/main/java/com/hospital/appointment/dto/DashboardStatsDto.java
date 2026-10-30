package com.hospital.appointment.dto;

import java.util.Map;

public class DashboardStatsDto {
    private long totalPatients;
    private long totalDoctors;
    private long totalDepartments;
    private long todayAppointmentsCount;
    private long upcomingAppointmentsCount;
    private long totalCompletedAppointments;
    private long totalCancelledAppointments;
    private Map<String, Long> appointmentsByStatus;

    public DashboardStatsDto() {}

    public long getTotalPatients() { return totalPatients; }
    public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }

    public long getTotalDoctors() { return totalDoctors; }
    public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public long getTodayAppointmentsCount() { return todayAppointmentsCount; }
    public void setTodayAppointmentsCount(long todayAppointmentsCount) { this.todayAppointmentsCount = todayAppointmentsCount; }

    public long getUpcomingAppointmentsCount() { return upcomingAppointmentsCount; }
    public void setUpcomingAppointmentsCount(long upcomingAppointmentsCount) { this.upcomingAppointmentsCount = upcomingAppointmentsCount; }

    public long getTotalCompletedAppointments() { return totalCompletedAppointments; }
    public void setTotalCompletedAppointments(long totalCompletedAppointments) { this.totalCompletedAppointments = totalCompletedAppointments; }

    public long getTotalCancelledAppointments() { return totalCancelledAppointments; }
    public void setTotalCancelledAppointments(long totalCancelledAppointments) { this.totalCancelledAppointments = totalCancelledAppointments; }

    public Map<String, Long> getAppointmentsByStatus() { return appointmentsByStatus; }
    public void setAppointmentsByStatus(Map<String, Long> appointmentsByStatus) { this.appointmentsByStatus = appointmentsByStatus; }
}
