using Domain.Entities;

namespace Domain.Interfaces;

public interface IUserRepository
{

    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<IEnumerable<User>>GetAllAsync();
    Task<bool>DeleteAsync(Guid id);
    
  Task<bool>UpdateAsync(User user);
        Task AddAsync(User user);
    Task<bool> SaveChangesAsync();
    Task<IEnumerable<User>> GetFilteredUsersAsync(string? term);
    void Update(User user); 
}
   