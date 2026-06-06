using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;
using Application.Services;

namespace Application.Services;

public class OrderService : IOrderService
{
    private readonly DataContext _context;

    public OrderService(DataContext context)
    {
        _context = context;
    }
    public async Task<OrderResponseDto> CreateAsync(CreateOrderDto dto, Guid userId)
    {
        
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(x => x.Id == dto.AppointmentId);

        if (appointment == null)
            throw new Exception("Appointment not found");

        
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

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return new OrderResponseDto
        {
            Id = order.Id,
            AppointmentId = order.AppointmentId,
            TotalAmount = order.TotalAmount,
            Status = order.Status
        };
    }

    public async Task<OrderResponseDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (order == null) return null;

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
        return await _context.Orders
            .Where(x => x.UserId == userId)
            .Select(order => new OrderResponseDto
            {
                Id = order.Id,
                AppointmentId = order.AppointmentId,
                TotalAmount = order.TotalAmount,
                Status = order.Status
            })
            .ToListAsync();
    }
    public async Task<bool> CancelAsync(Guid id, Guid userId)
{
    var order = await _context.Orders
        .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

    if (order == null)
        return false;

    order.Status = "Cancelled";

    await _context.SaveChangesAsync();

    return true;
}
}