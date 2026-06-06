using Application.DTOs;
namespace Application.Interfaces;
public interface IOrderAdminService
{
    Task<IEnumerable<OrderResponseDto>> GetAllOrdersAsync();
    Task<OrderResponseDto?> GetByIdAsync(Guid id);
    Task<bool> UpdateStatusAsync(Guid id, string status);
    Task<bool> DeleteAsync(Guid id);
}