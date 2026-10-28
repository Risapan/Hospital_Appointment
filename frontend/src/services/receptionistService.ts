import api from './api';
import { Appointment, UserSummary } from '../types';

export const receptionistService = {
  async searchPatients(query?: string): Promise<UserSummary[]> {
    const res = await api.get<UserSummary[]>('/receptionist/patients', { params: { query } });
    return res.data;
  },

  async registerWalkIn(data: { fullName: string; email: string; phoneNumber?: string; password?: string }): Promise<UserSummary> {
    const res = await api.post<UserSummary>('/receptionist/patients', data);
    return res.data;
  },

  async bookForPatient(data: {
    doctorId: string;
    patientId: string;
    startDateTime: string;
    reasonForVisit: string;
    patientNotes?: string;
  }): Promise<Appointment> {
    const res = await api.post<Appointment>('/receptionist/appointments', data);
    return res.data;
  },

  async getDailySchedule(date?: string): Promise<Appointment[]> {
    const res = await api.get<Appointment[]>('/receptionist/daily-schedule', { params: { date } });
    return res.data;
  }
};
