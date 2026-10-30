import api from './api';
import { AuthResponse, UserSummary } from '../types';

export const authService = {
  async login(email: string, password: string):Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('carepoint_token', res.data.token);
      localStorage.setItem('carepoint_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async register(data: { fullName: string; email: string; password: string; nic: string; phoneNumber?: string; role?: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('carepoint_token', res.data.token);
      localStorage.setItem('carepoint_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe(): Promise<UserSummary> {
    const res = await api.get<UserSummary>('/auth/me');
    localStorage.setItem('carepoint_user', JSON.stringify(res.data));
    return res.data;
  },

  logout() {
    localStorage.removeItem('carepoint_token');
    localStorage.removeItem('carepoint_user');
  },

  getStoredUser(): UserSummary | null {
    const stored = localStorage.getItem('carepoint_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('carepoint_token');
  }
};
