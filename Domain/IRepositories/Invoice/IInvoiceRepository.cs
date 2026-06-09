using Domain.Entities;

namespace Domain.Interfaces;
public interface IInvoiceRepository
    {
        Task AddAsync(Invoice invoice);
        Task<Invoice?> GetByIdAsync(Guid id);
        Task<Invoice?> GetByOrderIdAsync(Guid orderId);
        Task SaveChangesAsync();
    }