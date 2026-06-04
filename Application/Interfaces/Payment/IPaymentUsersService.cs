using Application.DTOs;
namespace Application.Interfaces;

public interface IPaymentUsersService
{
    Task<PaymentResponseDto> CreatePaymentAsync(CreatePaymentDto dto, Guid userId);
    Task<PaymentResponseDto?> GetMyPaymentAsync(Guid id);
}