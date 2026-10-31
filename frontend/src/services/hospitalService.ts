import api from './api';
import { Hospital } from '../types';

export const hospitalService = {
  async getHospitals(activeOnly = true): Promise<Hospital[]> {
    const res = await api.get<Hospital[]>('/hospitals', { params: { activeOnly } });
    return res.data;
  },

  async getHospitalById(id: string): Promise<Hospital> {
    const res = await api.get<Hospital>(`/hospitals/${id}`);
    return res.data;
  },

  async createHospital(data: Omit<Hospital, 'id' | 'doctorCount'>): Promise<Hospital> {
    const res = await api.post<Hospital>('/admin/hospitals', data);
    return res.data;
  },

  async updateHospital(id: string, data: Omit<Hospital, 'id' | 'doctorCount'>): Promise<Hospital> {
    const res = await api.put<Hospital>(`/admin/hospitals/${id}`, data);
    return res.data;
  },
};
