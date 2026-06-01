using Application.DTOs.Staff;

namespace Application.Interfaces;

public interface IStaffScheduleService
{
    Task<IReadOnlyList<WorkingHourResponseDto>> GetWorkingHoursAsync(Guid employeeId, CancellationToken ct = default);
    Task<WorkingHourResponseDto?> GetWorkingHourByIdAsync(Guid id, CancellationToken ct = default);
    Task<WorkingHourResponseDto> AddWorkingHourAsync(Guid employeeId, CreateUpdateWorkingHourDto dto, string? actor, CancellationToken ct = default);
    Task<WorkingHourResponseDto?> UpdateWorkingHourAsync(Guid id, CreateUpdateWorkingHourDto dto, string? actor, CancellationToken ct = default);
    Task<bool> DeleteWorkingHourAsync(Guid id, CancellationToken ct = default);

    Task<IReadOnlyList<DayOffResponseDto>> GetDaysOffAsync(Guid employeeId, CancellationToken ct = default);
    Task<DayOffResponseDto?> GetDayOffByIdAsync(Guid id, CancellationToken ct = default);
    Task<DayOffResponseDto> AddDayOffAsync(Guid employeeId, CreateUpdateDayOffDto dto, string? actor, CancellationToken ct = default);
    Task<DayOffResponseDto?> UpdateDayOffAsync(Guid id, CreateUpdateDayOffDto dto, string? actor, CancellationToken ct = default);
    Task<bool> DeleteDayOffAsync(Guid id, CancellationToken ct = default);

    Task<IReadOnlyList<ScheduleResponseDto>> GetSchedulesAsync(Guid employeeId, DateOnly? from, DateOnly? to, CancellationToken ct = default);
    Task<ScheduleResponseDto?> GetScheduleByIdAsync(Guid id, CancellationToken ct = default);
    Task<ScheduleResponseDto> AddScheduleAsync(Guid employeeId, CreateUpdateScheduleDto dto, string? actor, CancellationToken ct = default);
    Task<ScheduleResponseDto?> UpdateScheduleAsync(Guid id, CreateUpdateScheduleDto dto, string? actor, CancellationToken ct = default);
    Task<bool> DeleteScheduleAsync(Guid id, CancellationToken ct = default);
}
