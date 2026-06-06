using Domain.Entities;

namespace Application.Interfaces;
public interface IOrderItemRepository
{
    Task AddAsync(OrderItem item);
    Task<List<OrderItem>> GetByOrderIdAsync(Guid orderId);
    Task<List<OrderItem>> GetAllAsync();
    Task<OrderItem?> GetByIdAsync(Guid id);
}