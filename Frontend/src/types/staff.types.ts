// ============================================================
// [Member 2] - Staff Module Types
// ============================================================

export interface Employee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string | null;
  phone: string | null;
  isActive: boolean;
  serviceIds?: string[];
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Service {
  id: string;
  serviceCategoryId: string;
  serviceCategoryName: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  categoryName?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface WorkingHour {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface DayOff {
  id: string;
  date: string;
  reason: string | null;
}

export interface Location {
  id: string;
  name: string;
  addressLine: string | null;
  city: string | null;
  isActive: boolean;
}
export interface Room {
  id: string;
  locationId: string;
  locationName: string | null;
  name: string;
  capacity: number | null;
  isActive: boolean;
}
