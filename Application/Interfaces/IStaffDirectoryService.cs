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
}
