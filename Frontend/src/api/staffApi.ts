import api from './axiosConfig';
import type {
  Employee,
  Service,
  ServiceCategory,
  WorkingHour,
  DayOff,
  Room,
  Location
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

export const getEmployeeServices = (id: string): Promise<Employee> =>
  api.get(`/employees/${id}`).then((r) => r.data);

export const updateEmployeeServices = (
  id: string,
  serviceIds: string[]
): Promise<void> =>
  api.put(`/employees/${id}/services`, { serviceIds }).then(() => undefined);

// ── SERVICES ───────────────────────────────────────────────

export const getServices = (): Promise<Service[]> =>
  api.get('/services').then((r) => r.data);

export const createService = (data: Omit<Service, 'id' | 'serviceCategoryName' | 'categoryName'>): Promise<Service> =>
  api.post('/services', data).then((r) => r.data);

export const updateService = (id: string, data: Omit<Service, 'id' | 'serviceCategoryName' | 'categoryName'>): Promise<Service> =>
  api.put(`/services/${id}`, data).then((r) => r.data);

export const deleteService = (id: string): Promise<void> =>
  api.delete(`/services/${id}`).then(() => undefined);

// ── SERVICE CATEGORIES ─────────────────────────────────────

export const getServiceCategories = (): Promise<ServiceCategory[]> =>
  api.get('/service-categories').then((r) => r.data);

export const createServiceCategory = (data: Omit<ServiceCategory, 'id'>): Promise<ServiceCategory> =>
  api.post('/service-categories', data).then((r) => r.data);

export const updateServiceCategory = (
  id: string,
  data: Omit<ServiceCategory, 'id'>
): Promise<ServiceCategory> =>
  api.put(`/service-categories/${id}`, data).then((r) => r.data);

export const deleteServiceCategory = (id: string): Promise<void> =>
  api.delete(`/service-categories/${id}`).then(() => undefined);

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


// ── LOCATIONS ──────────────────────────────────────────────
export const getLocations = (): Promise<Location[]> =>
  api.get('/locations').then((r) => r.data);

export const createLocation = (data: Omit<Location, 'id'>): Promise<Location> =>
  api.post('/locations', data).then((r) => r.data);

export const updateLocation = (id: string, data: Omit<Location, 'id'>): Promise<Location> =>
  api.put(`/locations/${id}`, data).then((r) => r.data);

export const deleteLocation = (id: string): Promise<void> =>
  api.delete(`/locations/${id}`).then(() => undefined);

// ── ROOMS ──────────────────────────────────────────────────

export const getRoomsByLocation = (locationId: string): Promise<Room[]> =>
  api.get(`/rooms?locationId=${locationId}`).then((r) => r.data);

export const createRoom = (data: Omit<Room, 'id' | 'locationName'>): Promise<Room> =>
  api.post('/rooms', data).then((r) => r.data);

export const updateRoom = (id: string, data: Omit<Room, 'id' | 'locationName'>): Promise<Room> =>
  api.put(`/rooms/${id}`, data).then((r) => r.data);

export const deleteRoom = (id: string): Promise<void> =>
  api.delete(`/rooms/${id}`).then(() => undefined);