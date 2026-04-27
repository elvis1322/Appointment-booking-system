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

    public async Task<IReadOnlyList<Employee>> GetEmployeesAsync(bool includeInactive, CancellationToken ct = default)
{
    // Marrim të gjithë përdoruesit që kanë rolin 'Employee'
    var usersWithEmployeeRole = await _db.Users
        .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
        .Include(u => u.Employee).ThenInclude(e => e.ServiceLinks)
        .Where(u => u.UserRoles.Any(ur => ur.Role != null && ur.Role.Name == "Employee")) // [Member 2] - Null safety check
        .ToListAsync(ct);

    // I kthejmë si objekte Employee (edhe nëse nuk kanë ende rresht te tabela Employees)
    var result = usersWithEmployeeRole.Select(u => u.Employee ?? new Employee 
    { 
        Id = u.Id, // Vendosim Id e Userit si ID të përkohshme të Employee-t
        UserId = u.Id, 
        User = u, 
        IsActive = true,
        JobTitle = "I paplotësuar", // Vlerë default derisa t'i bësh Edit
        Phone = "-"
    }).ToList();

    if (!includeInactive)
    {
        result = result.Where(e => e.IsActive).ToList();
    }

    return result.OrderBy(e => e.User?.LastName ?? "").ThenBy(e => e.User?.FirstName ?? "").ToList(); // [Member 2] - Null safety sort
}


    public Task<Employee?> GetEmployeeByIdAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Employees
            .AsNoTracking()
            .Include(e => e.User)
            .Include(e => e.ServiceLinks)
            .FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public Task<Employee?> GetEmployeeByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId, ct);
    }

    public Task<Employee?> GetEmployeeForUpdateAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public Task<Employee?> GetEmployeeWithServicesForUpdateAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Employees
            .Include(e => e.ServiceLinks)
            .FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public Task<bool> UserExistsAsync(Guid userId, CancellationToken ct = default)
    {
        return _db.Users.AnyAsync(u => u.Id == userId, ct);
    }

    public Task<bool> ServiceExistsAsync(Guid serviceId, CancellationToken ct = default)
    {
        return _db.Services.AnyAsync(s => s.Id == serviceId, ct);
    }

    public Task AddEmployeeAsync(Employee employee, CancellationToken ct = default)
    {
        return _db.Employees.AddAsync(employee, ct).AsTask();
    }

    public async Task LoadEmployeeRelationsAsync(Employee employee, CancellationToken ct = default)
    {
        await _db.Entry(employee).Reference(e => e.User).LoadAsync(ct);
        await _db.Entry(employee).Collection(e => e.ServiceLinks).LoadAsync(ct);
    }

    public void RemoveEmployee(Employee employee)
    {
        _db.Employees.Remove(employee);
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
