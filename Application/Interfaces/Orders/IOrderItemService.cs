using Application.DTOs;

namespace Application.Interfaces;

public interface IOrderItemService
{
    Task<OrderItemResponseDto> CreateAsync(CreateOrderItemDto dto, Guid userId);

    Task<List<OrderItemResponseDto>> GetByOrderIdAsync(Guid orderId);

    Task<List<OrderItemResponseDto>> GetAllAsync();

    Task<OrderItemResponseDto?> GetByIdAsync(Guid id);
}