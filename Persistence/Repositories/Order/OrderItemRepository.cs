using Domain.Entities;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;

namespace Persistence.Repositories;

public class OrderItemRepository : IOrderItemRepository
{
    private readonly DataContext _context;

    public OrderItemRepository(DataContext context)
    {
        _context = context;
    }

    public async Task AddAsync(OrderItem item)
    {
        await _context.OrderItems.AddAsync(item);
        await _context.SaveChangesAsync();
    }

    public async Task<List<OrderItem>> GetByOrderIdAsync(Guid orderId)
    {
        return await _context.OrderItems
            .Where(x => x.OrderId == orderId)
            .ToListAsync();
    }

    public async Task<List<OrderItem>> GetAllAsync()
    {
        return await _context.OrderItems.ToListAsync();
    }

    public async Task<OrderItem?> GetByIdAsync(Guid id)
    {
        return await _context.OrderItems
            .FirstOrDefaultAsync(x => x.Id == id);
    }
}