export interface PaymentResponseDto {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  clientSecret: string;
}
