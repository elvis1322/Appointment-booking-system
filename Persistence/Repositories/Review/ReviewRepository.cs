using Domain.Entities;
using Domain.Interfaces;
using Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly DataContext _context;

    public ReviewRepository(DataContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Review review)
    {
        await _context.Reviews.AddAsync(review);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    private async Task PopulateNamesAsync(List<Review> reviews)
    {
        if (reviews == null || !reviews.Any()) return;

        var appointmentIds = reviews.Select(r => r.ServiceId).Distinct().ToList();
        var appointments = await _context.Appointments
            .Include(a => a.Service)
            .Include(a => a.Employee)
                .ThenInclude(e => e.User)
            .Where(a => appointmentIds.Contains(a.Id))
            .ToDictionaryAsync(a => a.Id);

        foreach (var r in reviews)
        {
            if (appointments.TryGetValue(r.ServiceId, out var app))
            {
                r.ServiceName = app.Service?.Name ?? "—";
                r.EmployeeName = app.Employee?.User != null 
                    ? $"{app.Employee.User.FirstName} {app.Employee.User.LastName}" 
                    : "Unknown";
            }
        }
    }

    public async Task<List<Review>> GetByServiceIdAsync(Guid serviceId)
    {
        var list = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ServiceId == serviceId)
            .ToListAsync();
        await PopulateNamesAsync(list);
        return list;
    }

    public async Task<List<Review>> GetByEmployeeIdAsync(Guid employeeUserId)
    {
        var employee = await _context.Set<Employee>().FirstOrDefaultAsync(e => e.UserId == employeeUserId);
        if (employee == null)
        {
            return new List<Review>();
        }

        var employeeAppointmentIds = await _context.Appointments
            .Where(a => a.EmployeeId == employee.Id)
            .Select(a => a.Id)
            .ToListAsync();

        var list = await _context.Reviews
            .Include(r => r.User)
            .Where(r => employeeAppointmentIds.Contains(r.ServiceId))
            .ToListAsync();
        await PopulateNamesAsync(list);
        return list;
    }

    public async Task<List<Review>> GetAllAsync()
    {
        var list = await _context.Reviews.Include(r => r.User).ToListAsync();
        await PopulateNamesAsync(list);
        return list;
    }

    public async Task<List<Review>> GetByUserIdAsync(Guid userId)
    {
        var list = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.UserId == userId)
            .ToListAsync();
        await PopulateNamesAsync(list);
        return list;
    }
}