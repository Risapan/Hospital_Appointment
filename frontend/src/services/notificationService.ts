import api from './api';
import { NotificationItem, PatientProfile } from '../types';

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await api.get<NotificationItem[]>('/notifications');
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return res.data.unreadCount;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  }
};

export const patientService = {
  async getMyProfile(): Promise<PatientProfile> {
    const res = await api.get<PatientProfile>('/patients/me');
    return res.data;
  },

  async updateMyProfile(data: Partial<PatientProfile>): Promise<PatientProfile> {
    const res = await api.put<PatientProfile>('/patients/me', data);
    return res.data;
  }
};
