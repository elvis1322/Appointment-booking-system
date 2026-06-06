using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;

namespace Persistence.Repositories;

public class OrderRepository : IOrderRepository
    {
        private readonly DataContext _context;

        public OrderRepository(DataContext context)
        {
            _context = context;
        }

        // Shto një order të ri
        public async Task AddAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
        }

        public void Remove(Order order)
        {
            _context.Orders.Remove(order);
        }

        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Appointment).ThenInclude(a => a.User)
                .Include(o => o.Appointment).ThenInclude(a => a.Service)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Order?> GetByIdAsync(Guid id)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Appointment).ThenInclude(a => a.User)
                .Include(o => o.Appointment).ThenInclude(a => a.Service)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<Order?> GetByIdForUserAsync(Guid id, Guid userId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Appointment).ThenInclude(a => a.User)
                .Include(o => o.Appointment).ThenInclude(a => a.Service)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        }

        public async Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }

