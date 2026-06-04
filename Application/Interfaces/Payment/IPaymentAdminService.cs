using Application.DTOs;
namespace Application.Interfaces;
public interface IPaymentAdminService
{
    Task<List<PaymentResponseDto>> GetAllAsync();
    Task<PaymentResponseDto?> UpdateStatusAsync(Guid id, string status);
    Task<bool> DeleteAsync(Guid id);
}