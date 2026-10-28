import api from './api';
import { DashboardStats, Appointment, Doctor, Department, AuditLogItem, UserSummary } from '../types';

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<DashboardStats>('/admin/dashboard');
    return res.data;
  },

  async getAllAppointments(): Promise<Appointment[]> {
    const res = await api.get<Appointment[]>('/admin/appointments');
    return res.data;
  },

  async getAllUsers(role?: string): Promise<UserSummary[]> {
    const res = await api.get<UserSummary[]>('/admin/users', { params: { role } });
    return res.data;
  },

  async createDoctor(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    departmentId: string;
    specialty: string;
    qualifications?: string;
  }): Promise<Doctor> {
    const res = await api.post<Doctor>('/admin/doctors', data);
    return res.data;
  },

  async updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor> {
    const res = await api.put<Doctor>(`/admin/doctors/${id}`, data);
    return res.data;
  },

  async setDoctorStatus(id: string, active: boolean): Promise<void> {
    await api.patch(`/admin/doctors/${id}/status`, null, { params: { active } });
  },

  async createDepartment(data: { name: string; description: string; icon?: string; active?: boolean }): Promise<Department> {
    const res = await api.post<Department>('/admin/departments', data);
    return res.data;
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const res = await api.put<Department>(`/admin/departments/${id}`, data);
    return res.data;
  },

  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`/admin/departments/${id}`);
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await api.get<AuditLogItem[]>('/admin/audit-logs');
    return res.data;
  }
};
