using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class OrderAdminService : IOrderAdminService
    {
        private readonly IOrderRepository _orderRepository;

        public OrderAdminService(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        public async Task<IEnumerable<OrderResponseDto>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            return orders.Select(o => new OrderResponseDto
            {
                Id = o.Id,
                AppointmentId = o.AppointmentId,
                UserId = o.UserId,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                UserName = o.User != null ? $"{o.User.FirstName} {o.User.LastName}" : 
                           (o.Appointment?.User != null ? $"{o.Appointment.User.FirstName} {o.Appointment.User.LastName}" : "Unknown")
            }).ToList();
        }

        public async Task<OrderResponseDto?> GetByIdAsync(Guid id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;

            return new OrderResponseDto
            {
                Id = order.Id,
                AppointmentId = order.AppointmentId,
                UserId = order.UserId,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                UserName = order.User != null ? $"{order.User.FirstName} {order.User.LastName}" : 
                           (order.Appointment?.User != null ? $"{order.Appointment.User.FirstName} {order.Appointment.User.LastName}" : "Unknown")
            };
        }

        public async Task<bool> UpdateStatusAsync(Guid id, string status)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return false;

            order.Status = status;
            await _orderRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return false;

            _orderRepository.Remove(order);
            await _orderRepository.SaveChangesAsync();
            return true;
        }
    }
}
