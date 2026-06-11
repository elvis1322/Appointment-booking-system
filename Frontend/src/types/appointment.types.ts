export interface AppointmentUserDto {
    id: string;
    userId?: string;
    employeeUserId?: string;

    startTime: string;
    endTime: string;

    occupiedUntil?: string;
    bufferTimeMinutes?: number;
    nextAvailableSlot?: string | null;

    statusName: string;
    serviceName: string;

    employeeName?: string;
    userName?: string;
}

export interface AppointmentAdminDto {
  id: string;
  startTime: string;
  endTime: string;
  occupiedUntil?: string;
  bufferTimeMinutes?: number;
  nextAvailableSlot?: string | null;
  statusName: string;
  serviceName?: string;
  userId?: string;
  workerId?: string;
  locationId?: string;
  userName?: string;
  employeeName?: string;
}

export interface CreateAppointmentUserDto {
  startTime: string;
  endTime?: string;  
  serviceId: string;
  EmployeeId: string;
}
