using Domain.Entities;
using Persistence.Data;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Repositories;
public class InvoiceRepository : IInvoiceRepository
    {
        private readonly DataContext _context;

        public InvoiceRepository(DataContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Invoice invoice)
        {
            await _context.Invoices.AddAsync(invoice);
        }

        public async Task<Invoice?> GetByIdAsync(Guid id)
        {
            return await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<Invoice?> GetByOrderIdAsync(Guid orderId)
        {
            return await _context.Invoices.FirstOrDefaultAsync(i => i.OrderId == orderId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
