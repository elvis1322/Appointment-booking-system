using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;

namespace Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DataContext _context;

    public UserRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
       return await _context.Users
        .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
        .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
        .Include(u => u.UserRoles)        // 1. Shkon te tabela ndërmjetëse (UserRoles)
            .ThenInclude(ur => ur.Role)  
            .FirstOrDefaultAsync(u=> u.Id==id);
    }

   public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
        .Include(u => u.UserRoles)        // 1. Shkon te tabela ndërmjetëse (UserRoles)
            .ThenInclude(ur => ur.Role)
             .ThenInclude(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)  
                    .AsNoTracking() // 2. Nga tabela ndërmjetëse, shkon te tabela Role
        .ToListAsync();
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public void Update(User user)
    {
        _context.Users.Update(user);
    }
    public async Task<bool>UpdateAsync(User user)
    {
        _context.Users.Update(user);
        return await _context.SaveChangesAsync() > 0;
    }

  public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return false;
   var tokens = _context.RefreshTokens.Where(t => t.UserId == id);
    _context.RefreshTokens.RemoveRange(tokens);
        _context.Users.Remove(user);
        return await _context.SaveChangesAsync() > 0;
    }
    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }



}