export interface ReviewDto {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  serviceName?: string;
  employeeName?: string;
  rating: number;
  comment: string;
}

export interface CreateReviewDto {
  appointmentId: string;
  rating: number;
  comment: string;
}
