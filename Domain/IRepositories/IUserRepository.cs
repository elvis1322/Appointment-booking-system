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
    void Update(User user); // EF Core e ndjek gjendjen, por është mirë ta kemi si metodë
}