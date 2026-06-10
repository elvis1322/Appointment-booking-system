import api from './axiosConfig';
export type OrderStatus =
  | 'Pending'
  | 'Paid'
  | 'Cancelled'
  | 'Completed';

export interface OrderResponseDto {
  id: string;
  appointmentId: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  userName?: string;
}

export interface CreateOrderDto {
  appointmentId: string;
  totalAmount: number;
}

// USER
/** GET /api/orders/my */
export const getMyOrders = async (): Promise<OrderResponseDto[]> => {
  const response = await api.get('/orders/my');
  return response.data;
};

/** GET /api/orders/{id} */
export const getOrderById = async (
  id: string
): Promise<OrderResponseDto> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

/** POST /api/orders */
export const createOrder = async (
  data: CreateOrderDto
): Promise<OrderResponseDto> => {
  const response = await api.post('/orders', data);

  // backend returns: { message, data }
  return response.data.data;
};

/** PUT /api/orders/{id}/cancel */
export const cancelOrder = async (id: string): Promise<void> => {
  await api.put(`/orders/${id}/cancel`);
};

// ADMIN
/** GET /api/admin/orders */
export const adminGetAllOrders = async (): Promise<
  OrderResponseDto[]
> => {
  const response = await api.get('/admin/orders');
  return response.data;
};

/** PUT /api/admin/orders/{id}/status */
export const adminUpdateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<void> => {
  await api.put(`/admin/orders/${id}/status`, { status });
};

/** DELETE /api/admin/orders/{id} */
export const adminDeleteOrder = async (
  id: string
): Promise<void> => {
  await api.delete(`/admin/orders/${id}`);
};