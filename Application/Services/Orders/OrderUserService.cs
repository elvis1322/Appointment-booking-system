using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Entities.Constants;

namespace Application.Services
{
    public class OrderUserService : IOrderUserService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IAppointmentRepository _appointmentRepository;

        public OrderUserService(IOrderRepository orderRepository, IAppointmentRepository appointmentRepository)
        {
            _orderRepository = orderRepository;
            _appointmentRepository = appointmentRepository;
        }

        //  Krijo  order
        public async Task<OrderResponseDto> CreateAsync(CreateOrderDto dto, Guid userId)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
            if (appointment == null)
                throw new Exception("Appointment nuk ekziston");

            var order = new Order
            {
                Id = Guid.NewGuid(),
                AppointmentId = dto.AppointmentId,
                UserId = userId,
                TotalAmount = dto.TotalAmount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = userId.ToString(),
                UpdatedBy = userId.ToString()
            };

            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();

            return new OrderResponseDto
            {
                Id = order.Id,
                AppointmentId = order.AppointmentId,
                TotalAmount = order.TotalAmount,
                Status = order.Status
            };
        }

        
        public async Task<IEnumerable<OrderResponseDto>> GetMyOrdersAsync(Guid userId)
        {
            var orders = await _orderRepository.GetByUserIdAsync(userId);

            return orders.Select(o => new OrderResponseDto
            {
                Id = o.Id,
                AppointmentId = o.AppointmentId,
                TotalAmount = o.TotalAmount,
                Status = o.Status
            }).ToList();
        }

        
        public async Task<OrderResponseDto?> GetByIdAsync(Guid id, Guid userId)
        {
            var order = await _orderRepository.GetByIdForUserAsync(id, userId);
            if (order == null)
                return null;

            return new OrderResponseDto
            {
                Id = order.Id,
                AppointmentId = order.AppointmentId,
                TotalAmount = order.TotalAmount,
                Status = order.Status
            };
        }
        public async Task<bool> CancelAsync(Guid id, Guid userId)
        {
            var order = await _orderRepository.GetByIdForUserAsync(id, userId);

            if (order == null)
                return false;

            order.Status = "Cancelled";
            await _orderRepository.SaveChangesAsync();

            return true;
        }
    }
}
