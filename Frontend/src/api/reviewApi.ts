import api from './axiosConfig';
import type {
  ReviewDto,
  CreateReviewDto,
} from '../types/review.types';


/** GET /api/user/reviews/my-reviews */
export const getMyReviews = async (): Promise<ReviewDto[]> => {
  const response = await api.get('/user/reviews/my-reviews');
  return response.data;
};

/** POST /api/user/reviews */
export const createReview = async (
  data: CreateReviewDto
): Promise<ReviewDto> => {
  const response = await api.post('/user/reviews', data);
  return response.data;
};

/** GET /api/employee/reviews */
export const employeeGetReviews = async (): Promise<ReviewDto[]> => {
  const response = await api.get('/employee/reviews');
  return response.data;
};

/** GET /api/admin/reviews */
export const adminGetAllReviews = async (): Promise<
  ReviewDto[]
> => {
  const response = await api.get('/admin/reviews');
  return response.data;
};