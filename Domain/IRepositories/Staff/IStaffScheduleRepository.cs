using Domain.Entities;

namespace Domain.Interfaces;

public interface IStaffScheduleRepository
{
    Task<bool> EmployeeExistsAsync(Guid employeeId, CancellationToken ct = default);
    Task<bool> RoomExistsAsync(Guid roomId, CancellationToken ct = default);

    Task<IReadOnlyList<WorkingHour>> GetWorkingHoursAsync(Guid employeeId, CancellationToken ct = default);
    Task<WorkingHour?> GetWorkingHourByIdAsync(Guid id, CancellationToken ct = default);
    Task<WorkingHour?> GetWorkingHourForUpdateAsync(Guid id, CancellationToken ct = default);
    Task AddWorkingHourAsync(WorkingHour workingHour, CancellationToken ct = default);
    void RemoveWorkingHour(WorkingHour workingHour);

    Task<IReadOnlyList<DayOff>> GetDaysOffAsync(Guid employeeId, CancellationToken ct = default);
    Task<DayOff?> GetDayOffByIdAsync(Guid id, CancellationToken ct = default);
    Task<DayOff?> GetDayOffForUpdateAsync(Guid id, CancellationToken ct = default);
    Task<bool> DayOffExistsAsync(Guid employeeId, DateOnly date, Guid? excludeId = null, CancellationToken ct = default);
    Task AddDayOffAsync(DayOff dayOff, CancellationToken ct = default);
    void RemoveDayOff(DayOff dayOff);

    Task<IReadOnlyList<Schedule>> GetSchedulesAsync(Guid employeeId, DateOnly? from, DateOnly? to, CancellationToken ct = default);
    Task<Schedule?> GetScheduleByIdAsync(Guid id, CancellationToken ct = default);
    Task<Schedule?> GetScheduleForUpdateAsync(Guid id, CancellationToken ct = default);
    Task AddScheduleAsync(Schedule schedule, CancellationToken ct = default);
    void RemoveSchedule(Schedule schedule);

    Task<bool> SaveChangesAsync(CancellationToken ct = default);
}
