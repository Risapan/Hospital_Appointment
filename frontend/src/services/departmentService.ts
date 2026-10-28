import api from './api';
import { Department } from '../types';

export const departmentService = {
  async getDepartments(activeOnly = true): Promise<Department[]> {
    const res = await api.get<Department[]>('/departments', { params: { activeOnly } });
    return res.data;
  },

  async getDepartmentById(id: string): Promise<Department> {
    const res = await api.get<Department>(`/departments/${id}`);
    return res.data;
  }
};
