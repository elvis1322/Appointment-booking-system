import api from './axiosConfig';
import type { PaymentResponseDto } from '../types/payment.types';

export type PaymentMethod = 'Stripe' | 'PayPal';

export interface CreatePaymentDto {
  orderId: string;

  amount: number;

  paymentMethod?: PaymentMethod;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}


export const getPaymentById = async (
  id: string
): Promise<PaymentResponseDto> => {
  const response = await api.get(`/PaymentUser/my/${id}`);
  return response.data;
};


export const createPayment = async (
  data: CreatePaymentDto
): Promise<PaymentResponseDto> => {
  const response = await api.post('/PaymentUser', data);
  return response.data;
};


export const createPaymentIntent = async (
  data: CreatePaymentDto
): Promise<PaymentIntentResponse> => {
  const response = await api.post(
    '/PaymentUser/create-intent',
    data
  );

  return response.data;
};


export const confirmPayment = async (
  paymentIntentId: string
): Promise<{ success: boolean }> => {
  const response = await api.post(
    '/payments/confirm',
    { paymentIntentId }
  );

  return response.data;
};