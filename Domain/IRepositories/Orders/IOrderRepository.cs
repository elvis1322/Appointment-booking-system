using Domain.Entities;
namespace Domain.Interfaces
{
    public interface IOrderRepository
    {
        Task AddAsync(Order order);
        void Remove(Order order);
        Task<IEnumerable<Order>> GetAllAsync();
        Task<Order?> GetByIdAsync(Guid id);
        Task<Order?> GetByIdForUserAsync(Guid id, Guid userId);
        Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId);
        Task<bool> SaveChangesAsync();
    }
}
