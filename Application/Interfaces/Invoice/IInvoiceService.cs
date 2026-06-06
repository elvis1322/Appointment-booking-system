using Application.DTOs;

namespace Application.Interfaces;
 public interface IInvoiceService
    {
        Task<InvoiceResponseDto?> GetInvoiceByIdAsync(Guid id);
        Task<InvoiceResponseDto> CreateInvoiceAsync(Guid orderId, Guid paymentId, decimal amount);
        Task<InvoiceResponseDto?> GetInvoiceByOrderIdAsync(Guid orderId); 
         Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId);
    }