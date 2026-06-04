using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;
public class PaymentAdminService : IPaymentAdminService
{
    private readonly IPaymentRepository _repo;

    public PaymentAdminService(IPaymentRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<PaymentResponseDto>> GetAllAsync()
    {
        var payments = await _repo.GetAllAsync();

        return payments.Select(p => new PaymentResponseDto
        {
            Id = p.Id,
            OrderId = p.OrderId,
            Amount = p.Amount,
            Status = p.Status
        }).ToList();
    }

    public async Task<PaymentResponseDto?> UpdateStatusAsync(Guid id, string status)
{
    var payment = await _repo.GetByIdAsync(id);
    if (payment == null) return null;

    payment.Status = status;
    payment.UpdatedAt = DateTime.UtcNow;

    _repo.Update(payment);
    await _repo.SaveChangesAsync();

    return new PaymentResponseDto
    {
        Id = payment.Id,
        OrderId = payment.OrderId,
        Amount = payment.Amount,
        Status = payment.Status
    };
}
    public async Task<bool> DeleteAsync(Guid id)
  {
    var payment = await _repo.GetByIdAsync(id);
    if (payment == null) return false;

    _repo.Remove(payment);
    return await _repo.SaveChangesAsync();
  }
}