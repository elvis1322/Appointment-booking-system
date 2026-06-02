import api from './axiosConfig';
import type {
  Employee
  
} from '../types/staff.types';

// ── EMPLOYEES ──────────────────────────────────────────────

export const getEmployees = (): Promise<Employee[]> =>
  api.get('/employees').then((r) => r.data);

export const createEmployee = (data: {
  firstName: string;
  lastName: string;
  email: string;
  gjinia?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
}): Promise<Employee> =>
  api.post('/employees', data).then((r) => r.data);

export const updateEmployee = (
  id: string,
  data: { jobTitle: string | null; phone: string | null; isActive: boolean }
): Promise<Employee> =>
  api.put(`/employees/${id}`, data).then((r) => r.data);

export const deleteEmployee = (id: string): Promise<void> =>
  api.delete(`/employees/${id}`).then(() => undefined);

