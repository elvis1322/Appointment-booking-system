using Stripe;
using Domain.Entities;
using Application.Interfaces;
using Application.DTOs;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Application.Services;
public class PaymentUserService : IPaymentUsersService
{
    private readonly IPaymentRepository _repo;
     private readonly IInvoiceService _invoiceService;
   public PaymentUserService(IPaymentRepository repo, IInvoiceService invoiceService)
{
    _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    _invoiceService = invoiceService ?? throw new ArgumentNullException(nameof(invoiceService));
}

    
    public async Task<PaymentResponseDto> CreatePaymentAsync(CreatePaymentDto dto, Guid userId)
    {
        
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(dto.Amount * 100), // cent
            Currency = "eur",
            PaymentMethodTypes = new List<string> { "card" }
        };

        var service = new PaymentIntentService();
        var intent = await service.CreateAsync(options);

        
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            OrderId = dto.OrderId,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            StripePaymentIntentId = intent.Id,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = userId.ToString(),
            UpdatedBy = userId.ToString()
        };

        await _repo.AddAsync(payment);
        await _repo.SaveChangesAsync();
        await _invoiceService.CreateInvoiceAsync(dto.OrderId, payment.Id, dto.Amount); 

        
        return new PaymentResponseDto
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            Amount = payment.Amount,
            Status = payment.Status,
            ClientSecret = intent.ClientSecret
        };
        
    }
    public async Task<PaymentResponseDto?> GetMyPaymentAsync(Guid id)
    {
        var payment = await _repo.GetByIdAsync(id);
        if (payment == null) return null;

        return new PaymentResponseDto
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            Amount = payment.Amount,
            Status = payment.Status,
            ClientSecret = "" 
        };
    }
}