using Application.DTOs.Staff;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services.Staff;

public class StaffDirectoryService : IStaffDirectoryService
{
    private readonly IStaffDirectoryRepository _repo;

    public StaffDirectoryService(IStaffDirectoryRepository repo) => _repo = repo;

    

    public async Task<IReadOnlyList<LocationResponseDto>> GetLocationsAsync(bool includeInactive, CancellationToken ct = default)
    {
        var list = await _repo.GetLocationsAsync(includeInactive, ct);
        return list.Select(MapLocation).ToList();
    }

    public async Task<LocationResponseDto?> GetLocationByIdAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetLocationByIdAsync(id, ct);
        return e == null ? null : MapLocation(e);
    }

    public async Task<LocationResponseDto> CreateLocationAsync(CreateUpdateLocationDto dto, string? actor, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) throw new ArgumentException("Name is required.");
        var now = DateTime.UtcNow;
        var e = new Location
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            AddressLine = dto.AddressLine,
            City = dto.City,
            IsActive = dto.IsActive,
            CreatedAt = now,
            CreatedBy = actor,
            UpdatedAt = now,
            UpdatedBy = actor
        };
        await _repo.AddLocationAsync(e, ct);
        await _repo.SaveChangesAsync(ct);
        return MapLocation(e);
    }

    public async Task<LocationResponseDto?> UpdateLocationAsync(Guid id, CreateUpdateLocationDto dto, string? actor, CancellationToken ct = default)
    {
        var e = await _repo.GetLocationForUpdateAsync(id, ct);
        if (e == null) return null;
        if (string.IsNullOrWhiteSpace(dto.Name)) throw new ArgumentException("Name is required.");
        e.Name = dto.Name.Trim();
        e.AddressLine = dto.AddressLine;
        e.City = dto.City;
        e.IsActive = dto.IsActive;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = actor;
        await _repo.SaveChangesAsync(ct);
        return MapLocation(e);
    }

    public async Task<bool> DeleteLocationAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetLocationForUpdateAsync(id, ct);
        if (e == null) return false;
        _repo.RemoveLocation(e);
        await _repo.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<RoomResponseDto>> GetRoomsAsync(Guid? locationId, bool includeInactive, CancellationToken ct = default)
    {
        var list = await _repo.GetRoomsAsync(locationId, includeInactive, ct);
        return list.Select(MapRoom).ToList();
    }

    public async Task<RoomResponseDto?> GetRoomByIdAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetRoomByIdAsync(id, ct);
        return e == null ? null : MapRoom(e);
    }

    public async Task<RoomResponseDto> CreateRoomAsync(CreateUpdateRoomDto dto, string? actor, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) throw new ArgumentException("Name is required.");
        if (!await _repo.LocationExistsAsync(dto.LocationId, ct))
            throw new InvalidOperationException("Location not found.");
        var now = DateTime.UtcNow;
        var e = new Room
        {
            Id = Guid.NewGuid(),
            LocationId = dto.LocationId,
            Name = dto.Name.Trim(),
            Capacity = dto.Capacity,
            IsActive = dto.IsActive,
            CreatedAt = now,
            CreatedBy = actor,
            UpdatedAt = now,
            UpdatedBy = actor
        };
        await _repo.AddRoomAsync(e, ct);
        await _repo.SaveChangesAsync(ct);
        await _repo.LoadRoomLocationAsync(e, ct);
        return MapRoom(e);
    }

    public async Task<RoomResponseDto?> UpdateRoomAsync(Guid id, CreateUpdateRoomDto dto, string? actor, CancellationToken ct = default)
    {
        var e = await _repo.GetRoomForUpdateAsync(id, ct);
        if (e == null) return null;
        if (string.IsNullOrWhiteSpace(dto.Name)) throw new ArgumentException("Name is required.");
        if (!await _repo.LocationExistsAsync(dto.LocationId, ct))
            throw new InvalidOperationException("Location not found.");
        e.LocationId = dto.LocationId;
        e.Name = dto.Name.Trim();
        e.Capacity = dto.Capacity;
        e.IsActive = dto.IsActive;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = actor;
        await _repo.SaveChangesAsync(ct);
        await _repo.LoadRoomLocationAsync(e, ct);
        return MapRoom(e);
    }

    public async Task<bool> DeleteRoomAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetRoomForUpdateAsync(id, ct);
        if (e == null) return false;
        _repo.RemoveRoom(e);
        await _repo.SaveChangesAsync(ct);
        return true;
    }


    private static LocationResponseDto MapLocation(Location l) => new()
    {
        Id = l.Id,
        Name = l.Name,
        AddressLine = l.AddressLine,
        City = l.City,
        IsActive = l.IsActive
    };

    private static RoomResponseDto MapRoom(Room r) => new()
    {
        Id = r.Id,
        LocationId = r.LocationId,
        LocationName = r.Location?.Name,
        Name = r.Name,
        Capacity = r.Capacity,
        IsActive = r.IsActive
    };
}
