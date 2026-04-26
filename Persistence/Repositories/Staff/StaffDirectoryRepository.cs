using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;

namespace Persistence.Repositories;

public class StaffDirectoryRepository : IStaffDirectoryRepository
{
    private readonly DataContext _db;

    public StaffDirectoryRepository(DataContext db)
    {
        _db = db;
    }


    public async Task<IReadOnlyList<Location>> GetLocationsAsync(bool includeInactive, CancellationToken ct = default)
    {
        var query = _db.Locations.AsNoTracking();

        if (!includeInactive)
        {
            query = query.Where(l => l.IsActive);
        }

        return await query.OrderBy(l => l.Name).ToListAsync(ct);
    }

    public Task<Location?> GetLocationByIdAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Locations.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id, ct);
    }

    public Task<Location?> GetLocationForUpdateAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Locations.FirstOrDefaultAsync(l => l.Id == id, ct);
    }

    public Task<bool> LocationExistsAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Locations.AnyAsync(l => l.Id == id, ct);
    }

    public Task AddLocationAsync(Location location, CancellationToken ct = default)
    {
        return _db.Locations.AddAsync(location, ct).AsTask();
    }

    public void RemoveLocation(Location location)
    {
        _db.Locations.Remove(location);
    }

    public async Task<IReadOnlyList<Room>> GetRoomsAsync(Guid? locationId, bool includeInactive, CancellationToken ct = default)
    {
        var query = _db.Rooms
            .AsNoTracking()
            .Include(r => r.Location)
            .AsQueryable();

        if (locationId.HasValue)
        {
            query = query.Where(r => r.LocationId == locationId.Value);
        }

        if (!includeInactive)
        {
            query = query.Where(r => r.IsActive);
        }

        return await query
            .OrderBy(r => r.Location!.Name)
            .ThenBy(r => r.Name)
            .ToListAsync(ct);
    }

    public Task<Room?> GetRoomByIdAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Rooms
            .AsNoTracking()
            .Include(r => r.Location)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public Task<Room?> GetRoomForUpdateAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Rooms.FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public Task AddRoomAsync(Room room, CancellationToken ct = default)
    {
        return _db.Rooms.AddAsync(room, ct).AsTask();
    }

    public Task LoadRoomLocationAsync(Room room, CancellationToken ct = default)
    {
        return _db.Entry(room).Reference(r => r.Location).LoadAsync(ct);
    }

    public void RemoveRoom(Room room)
    {
        _db.Rooms.Remove(room);
    }

    public async Task<bool> SaveChangesAsync(CancellationToken ct = default)
    {
        return await _db.SaveChangesAsync(ct) > 0;
    }
}
