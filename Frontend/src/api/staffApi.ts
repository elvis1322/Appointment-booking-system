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

// ── STAFF SCHEDULE ─────────────────────────────────────────

export const getWorkingHours = (employeeId: string): Promise<WorkingHour[]> =>
  api
    .get(`/staff-schedule/employees/${employeeId}/working-hours`)
    .then((r) => r.data);

export const createWorkingHour = (
  employeeId: string,
  data: { dayOfWeek: number; startTime: string; endTime: string }
): Promise<WorkingHour> =>
  api
    .post(`/staff-schedule/employees/${employeeId}/working-hours`, data)
    .then((r) => r.data);

export const updateWorkingHour = (
  id: string,
  data: { dayOfWeek: number; startTime: string; endTime: string }
): Promise<WorkingHour> =>
  api.put(`/staff-schedule/working-hours/${id}`, data).then((r) => r.data);

export const deleteWorkingHour = (id: string): Promise<void> =>
  api.delete(`/staff-schedule/working-hours/${id}`).then(() => undefined);

export const getDaysOff = (employeeId: string): Promise<DayOff[]> =>
  api
    .get(`/staff-schedule/employees/${employeeId}/days-off`)
    .then((r) => r.data);

export const createDayOff = (
  employeeId: string,
  data: { date: string; reason: string | null }
): Promise<DayOff> =>
  api
    .post(`/staff-schedule/employees/${employeeId}/days-off`, data)
    .then((r) => r.data);

export const updateDayOff = (
  id: string,
  data: { date: string; reason: string | null }
): Promise<DayOff> =>
  api.put(`/staff-schedule/days-off/${id}`, data).then((r) => r.data);

export const deleteDayOff = (id: string): Promise<void> =>
  api.delete(`/staff-schedule/days-off/${id}`).then(() => undefined);

