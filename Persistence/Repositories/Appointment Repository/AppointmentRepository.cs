using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;
using Domain.Entities.Constants;

namespace Persistence.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly DataContext _context;

    public AppointmentRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Appointment>> GetAllAsync()
    {
        return await _context.Appointments
            .Include(a => a.User)
            .Include(a => a.Status) 
            .Include(a => a.Service)
            .Include(a => a.Employee)
                .ThenInclude(e => e.User)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Appointment?> GetByIdAsync(Guid id) 
    {
        return await _context.Appointments
            .Include(a => a.User)
            .Include(a => a.Status)
            .Include(a => a.Service)
            .Include(a => a.Employee)
                .ThenInclude(e => e.User)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task AddAsync(Appointment appointment)
    {
        await _context.Appointments.AddAsync(appointment);
    }

    public void Update(Appointment appointment)
    {
        _context.Appointments.Update(appointment);
    }

    public async Task<bool> Delete(Guid id)
    {
         var appointment = await _context.Appointments.FindAsync(id);
    
    if (appointment == null) 
        return false;

    _context.Appointments.Remove(appointment);
    
    return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

public async Task<bool> IsSlotOccupiedAsync(DateTime start, DateTime end)
{
    return await _context.Appointments.AnyAsync(a =>
        a.StartTime < end &&
        a.EndTime > start &&
        (a.StatusId == AppDefaults.AppointmentStatus.Pending || 
         a.StatusId == AppDefaults.AppointmentStatus.Confirmed)
    );
}
public async Task<IEnumerable<Appointment>> GetByUserIdAsync(Guid userId)
{
    return await _context.Appointments
        .Include(a => a.User)
        .Include(a => a.Status)
        .Include(a => a.Service)
        .Include(a => a.Employee)
            .ThenInclude(e => e.User)
        .Where(a => a.UserId == userId)
        .ToListAsync();
}

public async Task<IEnumerable<Appointment>> GetByEmployeeUserIdAsync(Guid employeeUserId)
{
    var employee = await _context.Set<Employee>().FirstOrDefaultAsync(e => e.UserId == employeeUserId);
    if (employee == null)
    {
        return Enumerable.Empty<Appointment>();
    }

    return await _context.Appointments
        .Include(a => a.User)
        .Include(a => a.Status)
        .Include(a => a.Service)
        .Include(a => a.Employee)
            .ThenInclude(e => e.User)
        .Where(a => a.EmployeeId == employee.Id)
        .ToListAsync();
}

public async Task<IEnumerable<Appointment>> GetBookedSlotsByDateAsync(DateTime date)
{
    var dayStart = date.Date;
    var dayEnd = dayStart.AddDays(1);

    return await _context.Appointments
        .Where(a => a.StartTime < dayEnd && a.EndTime > dayStart &&
            (a.StatusId == AppDefaults.AppointmentStatus.Pending ||
             a.StatusId == AppDefaults.AppointmentStatus.Confirmed))
        .Select(a => new Appointment
        {
            Id = a.Id,
            StartTime = a.StartTime,
            EndTime = a.EndTime
        })
        .AsNoTracking()
        .ToListAsync();
}
    public async Task<Appointment?> GetNotificationDetailsAsync(Guid appointmentId)
    {
        return await _context.Appointments
            .Include(a => a.User)
            .Include(a => a.Employee)
                .ThenInclude(e => e.User)
            .Include(a => a.Service)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == appointmentId);
    }
}