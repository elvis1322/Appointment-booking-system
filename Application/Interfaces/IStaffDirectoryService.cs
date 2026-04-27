using Application.DTOs.Staff;

namespace Application.Interfaces;

public interface IStaffDirectoryService
{

    Task<IReadOnlyList<LocationResponseDto>> GetLocationsAsync(bool includeInactive, CancellationToken ct = default);
    Task<LocationResponseDto?> GetLocationByIdAsync(Guid id, CancellationToken ct = default);
    Task<LocationResponseDto> CreateLocationAsync(CreateUpdateLocationDto dto, string? actor, CancellationToken ct = default);
    Task<LocationResponseDto?> UpdateLocationAsync(Guid id, CreateUpdateLocationDto dto, string? actor, CancellationToken ct = default);
    Task<bool> DeleteLocationAsync(Guid id, CancellationToken ct = default);

    Task<IReadOnlyList<RoomResponseDto>> GetRoomsAsync(Guid? locationId, bool includeInactive, CancellationToken ct = default);
    Task<RoomResponseDto?> GetRoomByIdAsync(Guid id, CancellationToken ct = default);
    Task<RoomResponseDto> CreateRoomAsync(CreateUpdateRoomDto dto, string? actor, CancellationToken ct = default);
    Task<RoomResponseDto?> UpdateRoomAsync(Guid id, CreateUpdateRoomDto dto, string? actor, CancellationToken ct = default);
    Task<bool> DeleteRoomAsync(Guid id, CancellationToken ct = default);

    Task<IReadOnlyList<EmployeeResponseDto>> GetEmployeesAsync(bool includeInactive, CancellationToken ct = default);
    Task<EmployeeResponseDto?> GetEmployeeByIdAsync(Guid id, CancellationToken ct = default);
    Task<EmployeeResponseDto> CreateEmployeeAsync(CreateEmployeeDto dto, string? actor, CancellationToken ct = default);
    Task<EmployeeResponseDto?> UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto, string? actor, CancellationToken ct = default);
    Task<bool> DeleteEmployeeAsync(Guid id, CancellationToken ct = default);
    Task AssignServicesAsync(Guid employeeId, AssignEmployeeServicesDto dto, string? actor, CancellationToken ct = default);
}
