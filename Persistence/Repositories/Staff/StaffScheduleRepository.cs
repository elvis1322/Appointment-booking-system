using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;

namespace Persistence.Repositories;

public class StaffScheduleRepository : IStaffScheduleRepository
{
    private readonly DataContext _db;

    public StaffScheduleRepository(DataContext db)
    {
        _db = db;
    }

    public Task<bool> EmployeeExistsAsync(Guid employeeId, CancellationToken ct = default)
    {
        return _db.Employees.AnyAsync(e => e.Id == employeeId, ct);
    }

    public Task<bool> RoomExistsAsync(Guid roomId, CancellationToken ct = default)
    {
        return _db.Rooms.AnyAsync(r => r.Id == roomId, ct);
    }

    public async Task<IReadOnlyList<WorkingHour>> GetWorkingHoursAsync(Guid employeeId, CancellationToken ct = default)
{
    var list = await _db.WorkingHours
        .AsNoTracking()
        .Where(w => w.EmployeeId == employeeId)
        .OrderBy(w => w.DayOfWeek)
        .ToListAsync(ct);
    // ThenBy bëhet në memorie sepse SQLite nuk mbështet TimeSpan ORDER BY
    return list.OrderBy(w => w.DayOfWeek).ThenBy(w => w.StartTime).ToList();
}

    public Task<WorkingHour?> GetWorkingHourByIdAsync(Guid id, CancellationToken ct = default)
    {
        return _db.WorkingHours.AsNoTracking().FirstOrDefaultAsync(w => w.Id == id, ct);
    }

    public Task<WorkingHour?> GetWorkingHourForUpdateAsync(Guid id, CancellationToken ct = default)
    {
        return _db.WorkingHours.FirstOrDefaultAsync(w => w.Id == id, ct);
    }

    public Task AddWorkingHourAsync(WorkingHour workingHour, CancellationToken ct = default)
    {
        return _db.WorkingHours.AddAsync(workingHour, ct).AsTask();
    }

    public void RemoveWorkingHour(WorkingHour workingHour)
    {
        _db.WorkingHours.Remove(workingHour);
    }

    public async Task<IReadOnlyList<DayOff>> GetDaysOffAsync(Guid employeeId, CancellationToken ct = default)
    {
        return await _db.DaysOff
            .AsNoTracking()
            .Where(d => d.EmployeeId == employeeId)
            .OrderBy(d => d.Date)
            .ToListAsync(ct);
    }

    public Task<DayOff?> GetDayOffByIdAsync(Guid id, CancellationToken ct = default)
    {
        return _db.DaysOff.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id, ct);
    }

    public Task<DayOff?> GetDayOffForUpdateAsync(Guid id, CancellationToken ct = default)
    {
        return _db.DaysOff.FirstOrDefaultAsync(d => d.Id == id, ct);
    }

    public Task<bool> DayOffExistsAsync(Guid employeeId, DateOnly date, Guid? excludeId = null, CancellationToken ct = default)
    {
        return _db.DaysOff.AnyAsync(d =>
            d.EmployeeId == employeeId &&
            d.Date == date &&
            (!excludeId.HasValue || d.Id != excludeId.Value), ct);
    }

    public Task AddDayOffAsync(DayOff dayOff, CancellationToken ct = default)
    {
        return _db.DaysOff.AddAsync(dayOff, ct).AsTask();
    }

    public void RemoveDayOff(DayOff dayOff)
    {
        _db.DaysOff.Remove(dayOff);
    }

    public async Task<IReadOnlyList<Schedule>> GetSchedulesAsync(Guid employeeId, DateOnly? from, DateOnly? to, CancellationToken ct = default)
    {
        var query = _db.Schedules.AsNoTracking().Where(s => s.EmployeeId == employeeId);

        if (from.HasValue)
        {
            query = query.Where(s => s.Date >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(s => s.Date <= to.Value);
        }

        return await query
            .OrderBy(s => s.Date)
            .ThenBy(s => s.StartTime)
            .ToListAsync(ct);
    }

    public Task<Schedule?> GetScheduleByIdAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Schedules.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public Task<Schedule?> GetScheduleForUpdateAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Schedules.FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public Task AddScheduleAsync(Schedule schedule, CancellationToken ct = default)
    {
        return _db.Schedules.AddAsync(schedule, ct).AsTask();
    }

    public void RemoveSchedule(Schedule schedule)
    {
        _db.Schedules.Remove(schedule);
    }

    public async Task<bool> SaveChangesAsync(CancellationToken ct = default)
    {
        return await _db.SaveChangesAsync(ct) > 0;
    }
}
