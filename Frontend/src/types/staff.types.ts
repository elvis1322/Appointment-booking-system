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
