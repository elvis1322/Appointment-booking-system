import api from './axiosConfig';
import type { InvoiceResponseDto } from '../types/invoice.types';


export const getInvoiceById = async (
  id: string
): Promise<InvoiceResponseDto> => {
  const response = await api.get(
    `/user/invoices/${id}`
  );

  return response.data;
};

/** GET /api/user/invoices/order/{orderId} */
export const getInvoiceByOrderId = async (
  orderId: string
): Promise<InvoiceResponseDto> => {
  const response = await api.get(
    `/user/invoices/order/${orderId}`
  );

  return response.data;
};

/**
 * GET /api/user/invoices/{id}/pdf
 * Returns invoice PDF as Blob
 */
export const downloadInvoicePdf = async (
  invoiceId: string
): Promise<Blob> => {
  const response = await api.get(
    `/user/invoices/${invoiceId}/pdf`,
    {
      responseType: 'blob',
    }
  );

  return response.data;
};

export const downloadInvoicePdfFile = async (
  invoiceId: string
): Promise<void> => {
  const blob = await downloadInvoicePdf(invoiceId);

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.download = `invoice-${invoiceId}.pdf`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};