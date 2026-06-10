import api from './axiosConfig';
import type {AppointmentUserDto,CreateAppointmentUserDto,AppointmentAdminDto,} from '../types/appointment.types';


export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Cancelled'
  | 'Completed';

// USER
/** GET /api/Appointments/GetMyAppointments */
export const getAppointments = async (): Promise<
  AppointmentUserDto[]
> => {
  const response = await api.get(
    '/Appointments/GetMyAppointments'
  );

  return response.data.data;
};

/** POST /api/Appointments/create */
export const createAppointment = async (
  data: CreateAppointmentUserDto
): Promise<AppointmentUserDto> => {
  const response = await api.post(
    '/Appointments/create',
    data
  );

  return response.data.data;
};

/** GET /api/Appointments/GetByIdMyAppointments/{id} */
export const getAppointmentById = async (
  id: string
): Promise<AppointmentUserDto> => {
  const response = await api.get(
    `/Appointments/GetByIdMyAppointments/${id}`
  );

  return response.data.data;
};

/** POST /api/Appointments/cancelmyAppointment/{id} */
export const cancelAppointment = async (
  id: string
): Promise<void> => {
  await api.post(
    `/Appointments/cancelmyAppointment/${id}`
  );
};

// Booked-slots types & API
export interface BookedSlot {
  startTime: string;
  endTime: string;
}

/** GET /api/Appointments/booked-slots?date=YYYY-MM-DD */
export const getBookedSlots = async (
  date: string
): Promise<BookedSlot[]> => {
  const response = await api.get(
    `/Appointments/booked-slots?date=${date}`
  );

  return response.data.data;
};

// ADMIN
/** GET /api/AppointmentsAdmin/GetAllAppointments */
export const adminGetAllAppointments = async (): Promise<
  AppointmentAdminDto[]
> => {
  const response = await api.get(
    '/AppointmentsAdmin/GetAllAppointments'
  );

  return response.data;
};

const STATUS_MAP: Record<AppointmentStatus, string> = {
  Pending: '11111111-1111-1111-1111-111111111111',
  Confirmed: '22222222-2222-2222-2222-222222222222',
  Cancelled: '33333333-3333-3333-3333-333333333333',
  Completed: '44444444-4444-4444-4444-444444444444',
};

/** PUT /api/AppointmentsAdmin/{id}/status */
export const adminChangeAppointmentStatus = async (
  id: string,
  status: AppointmentStatus
): Promise<AppointmentAdminDto> => {
  const response = await api.put(
    `/AppointmentsAdmin/${id}/status`,
    { statusId: STATUS_MAP[status] }
  );

  return response.data;
};

/** DELETE /api/AppointmentsAdmin/DeleteAppointment/{id} */
export const adminDeleteAppointment = async (
  id: string
): Promise<void> => {
  await api.delete(
    `/AppointmentsAdmin/DeleteAppointment/${id}`
  );
};