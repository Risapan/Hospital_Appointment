import api from './api';
import { Doctor, TimeSlot, Availability, BlockedPeriod } from '../types';

export const doctorService = {
  async getAllDoctors(params?: { departmentId?: string; specialty?: string; search?: string; activeOnly?: boolean }): Promise<Doctor[]> {
    const res = await api.get<Doctor[]>('/doctors', { params });
    return res.data;
  },

  async getDoctorById(id: string): Promise<Doctor> {
    const res = await api.get<Doctor>(`/doctors/${id}`);
    return res.data;
  },

  async getDoctorSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    const res = await api.get<TimeSlot[]>(`/doctors/${doctorId}/availability`, {
      params: { date },
    });
    return res.data;
  },

  async getDoctorSchedules(doctorId: string): Promise<Availability[]> {
    const res = await api.get<Availability[]>(`/doctors/${doctorId}/schedules`);
    return res.data;
  },

  // Doctor portal specific operations
  async getMyProfile(): Promise<Doctor> {
    const res = await api.get<Doctor>('/doctor/profile');
    return res.data;
  },

  async updateMyProfile(data: Partial<Doctor>): Promise<Doctor> {
    const res = await api.put<Doctor>('/doctor/profile', data);
    return res.data;
  },

  async updateAvailability(availabilities: Availability[]): Promise<Availability[]> {
    const res = await api.put<Availability[]>('/doctor/availability', availabilities);
    return res.data;
  },

  async getBlockedPeriods(): Promise<BlockedPeriod[]> {
    const res = await api.get<BlockedPeriod[]>('/doctor/blocked-periods');
    return res.data;
  },

  async addBlockedPeriod(period: Omit<BlockedPeriod, 'id'>): Promise<BlockedPeriod> {
    const res = await api.post<BlockedPeriod>('/doctor/blocked-periods', period);
    return res.data;
  },

  async deleteBlockedPeriod(id: string): Promise<void> {
    await api.delete(`/doctor/blocked-periods/${id}`);
  }
};
