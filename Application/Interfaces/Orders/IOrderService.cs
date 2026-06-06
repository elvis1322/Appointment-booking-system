using Application.DTOs;
namespace Application.Interfaces;
public interface IOrderService
{
    Task<OrderResponseDto> CreateAsync(CreateOrderDto dto, Guid userId);

    Task<OrderResponseDto?> GetByIdAsync(Guid id, Guid userId);

    Task<IEnumerable<OrderResponseDto>> GetMyOrdersAsync(Guid userId);
    Task<bool> CancelAsync(Guid id, Guid userId);
}
