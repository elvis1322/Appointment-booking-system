using Domain.Entities;
using Domain.Interfaces;
using Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly DataContext _context;

    public PaymentRepository(DataContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Payment payment)
    {
        await _context.Payments.AddAsync(payment);
    }

    public void Update(Payment payment)
    {
        _context.Payments.Update(payment);
    }

    public void Remove(Payment payment)
    {
        _context.Payments.Remove(payment);
    }

    public async Task<Payment?> GetByIdAsync(Guid id)
    {
        return await _context.Payments.FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<Payment>> GetAllAsync()
    {
        return await _context.Payments.AsNoTracking().ToListAsync();
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}