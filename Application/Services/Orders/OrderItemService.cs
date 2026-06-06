using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class OrderItemService : IOrderItemService
{
    private readonly IOrderItemRepository _repo;

    public OrderItemService(IOrderItemRepository repo)
    {
        _repo = repo;
    }

    
    public async Task<OrderItemResponseDto> CreateAsync(CreateOrderItemDto dto, Guid userId)
    {
        var item = new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = dto.OrderId,
            Description = dto.Description,
            Price = dto.Price,

            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = userId.ToString(),
            UpdatedBy = userId.ToString()
        };

        await _repo.AddAsync(item);

        return new OrderItemResponseDto
        {
            Id = item.Id,
            OrderId = item.OrderId,
            Description = item.Description,
            Price = item.Price
        };
    }

    
    public async Task<List<OrderItemResponseDto>> GetByOrderIdAsync(Guid orderId)
    {
        var items = await _repo.GetByOrderIdAsync(orderId);

        return items.Select(x => new OrderItemResponseDto
        {
            Id = x.Id,
            OrderId = x.OrderId,
            Description = x.Description,
            Price = x.Price
        }).ToList();
    }

    // GET ALL (ADMIN)
    public async Task<List<OrderItemResponseDto>> GetAllAsync()
    {
        var items = await _repo.GetAllAsync();

        return items.Select(x => new OrderItemResponseDto
        {
            Id = x.Id,
            OrderId = x.OrderId,
            Description = x.Description,
            Price = x.Price
        }).ToList();
    }

    // GET BY ID (ADMIN)
    public async Task<OrderItemResponseDto?> GetByIdAsync(Guid id)
    {
        var item = await _repo.GetByIdAsync(id);

        if (item == null) return null;

        return new OrderItemResponseDto
        {
            Id = item.Id,
            OrderId = item.OrderId,
            Description = item.Description,
            Price = item.Price
        };
    }
}