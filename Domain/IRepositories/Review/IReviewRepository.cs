using Domain.Entities;

namespace Domain.Interfaces;

public interface IReviewRepository
{
    Task AddAsync(Review review);
    Task SaveChangesAsync();
    Task<List<Review>> GetByServiceIdAsync(Guid serviceId);
    Task<List<Review>> GetByEmployeeIdAsync(Guid employeeId);
    Task<List<Review>> GetByUserIdAsync(Guid userId);
    Task<List<Review>> GetAllAsync();
}