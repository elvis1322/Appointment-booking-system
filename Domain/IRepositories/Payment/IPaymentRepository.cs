using Domain.Entities;

namespace Domain.Interfaces;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(Guid id);
    Task<List<Payment>> GetAllAsync();
    Task AddAsync(Payment payment);
    void Update(Payment payment);
    void Remove(Payment payment);
    Task<bool> SaveChangesAsync();
}