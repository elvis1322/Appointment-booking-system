using Application.DTOs.Staff;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services.Staff;

public class StaffScheduleService : IStaffScheduleService
{
    private readonly IStaffScheduleRepository _repo;

    public StaffScheduleService(IStaffScheduleRepository repo) => _repo = repo;

    private static void EnsureTimeOrder(TimeSpan start, TimeSpan end)
    {
        if (end <= start) throw new ArgumentException("End time must be after start time.");
    }

    public async Task<IReadOnlyList<WorkingHourResponseDto>> GetWorkingHoursAsync(Guid employeeId, CancellationToken ct = default)
    {
        await EnsureEmployeeExists(employeeId, ct);
        var list = await _repo.GetWorkingHoursAsync(employeeId, ct);
        return list.Select(MapWh).ToList();
    }

    public async Task<WorkingHourResponseDto?> GetWorkingHourByIdAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetWorkingHourByIdAsync(id, ct);
        return e == null ? null : MapWh(e);
    }

    public async Task<WorkingHourResponseDto> AddWorkingHourAsync(Guid employeeId, CreateUpdateWorkingHourDto dto, string? actor, CancellationToken ct = default)
    {
        await EnsureEmployeeExists(employeeId, ct);
        EnsureTimeOrder(dto.StartTime, dto.EndTime);
        if (dto.RoomId.HasValue && !await _repo.RoomExistsAsync(dto.RoomId.Value, ct))
            throw new InvalidOperationException("Room not found.");
        var now = DateTime.UtcNow;
        var e = new WorkingHour
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            DayOfWeek = dto.DayOfWeek,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            RoomId = dto.RoomId,
            CreatedAt = now,
            CreatedBy = actor,
            UpdatedAt = now,
            UpdatedBy = actor
        };
        await _repo.AddWorkingHourAsync(e, ct);
        await _repo.SaveChangesAsync(ct);
        return MapWh(e);
    }

    public async Task<WorkingHourResponseDto?> UpdateWorkingHourAsync(Guid id, CreateUpdateWorkingHourDto dto, string? actor, CancellationToken ct = default)
    {
        var e = await _repo.GetWorkingHourForUpdateAsync(id, ct);
        if (e == null) return null;
        EnsureTimeOrder(dto.StartTime, dto.EndTime);
        if (dto.RoomId.HasValue && !await _repo.RoomExistsAsync(dto.RoomId.Value, ct))
            throw new InvalidOperationException("Room not found.");
        e.DayOfWeek = dto.DayOfWeek;
        e.StartTime = dto.StartTime;
        e.EndTime = dto.EndTime;
        e.RoomId = dto.RoomId;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = actor;
        await _repo.SaveChangesAsync(ct);
        return MapWh(e);
    }

    public async Task<bool> DeleteWorkingHourAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetWorkingHourForUpdateAsync(id, ct);
        if (e == null) return false;
        _repo.RemoveWorkingHour(e);
        await _repo.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<DayOffResponseDto>> GetDaysOffAsync(Guid employeeId, CancellationToken ct = default)
    {
        await EnsureEmployeeExists(employeeId, ct);
        var list = await _repo.GetDaysOffAsync(employeeId, ct);
        return list.Select(MapDo).ToList();
    }

    public async Task<DayOffResponseDto?> GetDayOffByIdAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetDayOffByIdAsync(id, ct);
        return e == null ? null : MapDo(e);
    }

    public async Task<DayOffResponseDto> AddDayOffAsync(Guid employeeId, CreateUpdateDayOffDto dto, string? actor, CancellationToken ct = default)
    {
        await EnsureEmployeeExists(employeeId, ct);
        if (await _repo.DayOffExistsAsync(employeeId, dto.Date, null, ct))
            throw new InvalidOperationException("A day off already exists for this date.");
        var now = DateTime.UtcNow;
        var e = new DayOff
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            Date = dto.Date,
            Reason = dto.Reason,
            CreatedAt = now,
            CreatedBy = actor,
            UpdatedAt = now,
            UpdatedBy = actor
        };
        await _repo.AddDayOffAsync(e, ct);
        await _repo.SaveChangesAsync(ct);
        return MapDo(e);
    }

    public async Task<DayOffResponseDto?> UpdateDayOffAsync(Guid id, CreateUpdateDayOffDto dto, string? actor, CancellationToken ct = default)
    {
        var e = await _repo.GetDayOffForUpdateAsync(id, ct);
        if (e == null) return null;
        if (await _repo.DayOffExistsAsync(e.EmployeeId, dto.Date, id, ct))
            throw new InvalidOperationException("A day off already exists for this date.");
        e.Date = dto.Date;
        e.Reason = dto.Reason;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = actor;
        await _repo.SaveChangesAsync(ct);
        return MapDo(e);
    }

    public async Task<bool> DeleteDayOffAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetDayOffForUpdateAsync(id, ct);
        if (e == null) return false;
        _repo.RemoveDayOff(e);
        await _repo.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<ScheduleResponseDto>> GetSchedulesAsync(Guid employeeId, DateOnly? from, DateOnly? to, CancellationToken ct = default)
    {
        await EnsureEmployeeExists(employeeId, ct);
        var list = await _repo.GetSchedulesAsync(employeeId, from, to, ct);
        return list.Select(MapSc).ToList();
    }

    public async Task<ScheduleResponseDto?> GetScheduleByIdAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetScheduleByIdAsync(id, ct);
        return e == null ? null : MapSc(e);
    }

    public async Task<ScheduleResponseDto> AddScheduleAsync(Guid employeeId, CreateUpdateScheduleDto dto, string? actor, CancellationToken ct = default)
    {
        await EnsureEmployeeExists(employeeId, ct);
        EnsureTimeOrder(dto.StartTime, dto.EndTime);
        if (dto.RoomId.HasValue && !await _repo.RoomExistsAsync(dto.RoomId.Value, ct))
            throw new InvalidOperationException("Room not found.");
        var now = DateTime.UtcNow;
        var e = new Schedule
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            Date = dto.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            RoomId = dto.RoomId,
            Notes = dto.Notes,
            CreatedAt = now,
            CreatedBy = actor,
            UpdatedAt = now,
            UpdatedBy = actor
        };
        await _repo.AddScheduleAsync(e, ct);
        await _repo.SaveChangesAsync(ct);
        return MapSc(e);
    }

    public async Task<ScheduleResponseDto?> UpdateScheduleAsync(Guid id, CreateUpdateScheduleDto dto, string? actor, CancellationToken ct = default)
    {
        var e = await _repo.GetScheduleForUpdateAsync(id, ct);
        if (e == null) return null;
        EnsureTimeOrder(dto.StartTime, dto.EndTime);
        if (dto.RoomId.HasValue && !await _repo.RoomExistsAsync(dto.RoomId.Value, ct))
            throw new InvalidOperationException("Room not found.");
        e.Date = dto.Date;
        e.StartTime = dto.StartTime;
        e.EndTime = dto.EndTime;
        e.RoomId = dto.RoomId;
        e.Notes = dto.Notes;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = actor;
        await _repo.SaveChangesAsync(ct);
        return MapSc(e);
    }

    public async Task<bool> DeleteScheduleAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetScheduleForUpdateAsync(id, ct);
        if (e == null) return false;
        _repo.RemoveSchedule(e);
        await _repo.SaveChangesAsync(ct);
        return true;
    }

    private async Task EnsureEmployeeExists(Guid employeeId, CancellationToken ct)
    {
        if (!await _repo.EmployeeExistsAsync(employeeId, ct))
            throw new InvalidOperationException("Employee not found.");
    }

    private static WorkingHourResponseDto MapWh(WorkingHour w) => new()
    {
        Id = w.Id,
        EmployeeId = w.EmployeeId,
        DayOfWeek = w.DayOfWeek,
        StartTime = w.StartTime,
        EndTime = w.EndTime,
        RoomId = w.RoomId
    };

    private static DayOffResponseDto MapDo(DayOff d) => new()
    {
        Id = d.Id,
        EmployeeId = d.EmployeeId,
        Date = d.Date,
        Reason = d.Reason
    };

    private static ScheduleResponseDto MapSc(Schedule s) => new()
    {
        Id = s.Id,
        EmployeeId = s.EmployeeId,
        Date = s.Date,
        StartTime = s.StartTime,
        EndTime = s.EndTime,
        RoomId = s.RoomId,
        Notes = s.Notes
    };
}
