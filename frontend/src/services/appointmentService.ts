import api from './api';
import { Appointment, AppointmentStatus } from '../types';

export const appointmentService = {
  async bookAppointment(data: {
    doctorId: string;
    departmentId?: string;
    startDateTime: string;
    reasonForVisit: string;
    patientNotes?: string;
    patientId?: string;
  }): Promise<Appointment> {
    const res = await api.post<Appointment>('/appointments', data);
    return res.data;
  },

  async getMyAppointments(): Promise<Appointment[]> {
    const res = await api.get<Appointment[]>('/appointments/my');
    return res.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const res = await api.get<Appointment>(`/appointments/${id}`);
    return res.data;
  },

  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    const res = await api.patch<Appointment>(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },

  async rescheduleAppointment(id: string, newStartDateTime: string, reason?: string): Promise<Appointment> {
    const res = await api.patch<Appointment>(`/appointments/${id}/reschedule`, {
      newStartDateTime,
      reason,
    });
    return res.data;
  },

  // Doctor status updates
  async updateDoctorAppointmentStatus(id: string, status: AppointmentStatus, doctorNotes?: string): Promise<Appointment> {
    const res = await api.patch<Appointment>(`/doctor/appointments/${id}/status`, {
      status,
      doctorNotes,
    });
    return res.data;
  },

  async getDoctorAppointments(): Promise<Appointment[]> {
    const res = await api.get<Appointment[]>('/doctor/appointments');
    return res.data;
  }
};
