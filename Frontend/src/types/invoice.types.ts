export interface InvoiceResponseDto {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  status: string;
}
