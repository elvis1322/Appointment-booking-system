using Application.DTOs.Staff;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services.Staff;

public class StaffDirectoryService : IStaffDirectoryService
{
    private readonly IStaffDirectoryRepository _repo;

    public StaffDirectoryService(IStaffDirectoryRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<EmployeeResponseDto>> GetEmployeesAsync(bool includeInactive, CancellationToken ct = default)
    {
        var list = await _repo.GetEmployeesAsync(includeInactive, ct);
        return list.Select(MapEmployee).ToList();
    }

    public async Task<EmployeeResponseDto?> GetEmployeeByIdAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetEmployeeByIdAsync(id, ct);
        return e == null ? null : MapEmployee(e);
    }

    public async Task<EmployeeResponseDto> CreateEmployeeAsync(CreateEmployeeDto dto, string? actor, CancellationToken ct = default)
    {
        if (!await _repo.UserExistsAsync(dto.UserId, ct)) throw new InvalidOperationException("User not found.");
        if (await _repo.GetEmployeeByUserIdAsync(dto.UserId, ct) != null)
            throw new InvalidOperationException("This user already has an employee profile.");
        var now = DateTime.UtcNow;
        var e = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            JobTitle = dto.JobTitle,
            Phone = dto.Phone,
            IsActive = true,
            CreatedAt = now,
            CreatedBy = actor,
            UpdatedAt = now,
            UpdatedBy = actor
        };
        await _repo.AddEmployeeAsync(e, ct);
        await _repo.SaveChangesAsync(ct);
        await _repo.LoadEmployeeRelationsAsync(e, ct);
        return MapEmployee(e);
    }

   public async Task<EmployeeResponseDto?> UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto, string? actor, CancellationToken ct = default)
    {
        // 1. Shkojmë e kërkojmë nëse ekziston profili
        var e = await _repo.GetEmployeeForUpdateAsync(id, ct);

        // 2. Nëse nuk ekziston (sepse është krijuar vetëm si User nga kolegu), e krijojmë tani profile-in
        if (e == null)
        {
            e = new Employee
            {
                Id = id, // Përdorim të njëjtën ID (që është UserId)
                UserId = id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = actor
            };
            await _repo.AddEmployeeAsync(e, ct);
        }

        // 3. I japim të dhënat e reja
        e.JobTitle = dto.JobTitle;
        e.Phone = dto.Phone;
        e.IsActive = dto.IsActive;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = actor;

        await _repo.SaveChangesAsync(ct);
        await _repo.LoadEmployeeRelationsAsync(e, ct);

        return MapEmployee(e);
    }


    public async Task<bool> DeleteEmployeeAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetEmployeeForUpdateAsync(id, ct);
        if (e == null) return false;
        _repo.RemoveEmployee(e);
        await _repo.SaveChangesAsync(ct);
        return true;
    }

    public async Task AssignServicesAsync(Guid employeeId, AssignEmployeeServicesDto dto, string? actor, CancellationToken ct = default)
    {
        // 1. Kërkojmë profilin (provojmë si me ID ashtu edhe me UserId për siguri)
        var emp = await _repo.GetEmployeeWithServicesForUpdateAsync(employeeId, ct);
        
        if (emp == null)
        {
            // Provojmë të kërkojmë specifikisht me UserId nëse nuk u gjet me ID
            var allEmps = await _repo.GetEmployeesAsync(true, ct);
            emp = allEmps.FirstOrDefault(e => e.UserId == employeeId);
            
            if (emp != null)
            {
                // Nëse e gjetëm me UserId, duhet të ngarkojmë marrëdhëniet për update
                emp = await _repo.GetEmployeeWithServicesForUpdateAsync(emp.Id, ct);
            }
        }

        // 2. Nëse ende nuk ekziston, e krijojmë tani
        if (emp == null)
        {
            if (!await _repo.UserExistsAsync(employeeId, ct)) 
                throw new InvalidOperationException("User not found.");

            emp = new Employee
            {
                Id = employeeId, // Përdorim të njëjtën ID
                UserId = employeeId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = actor,
                ServiceLinks = new List<EmployeeServiceRelation>()
            };
            await _repo.AddEmployeeAsync(emp, ct);
        }

        // 3. Validimi i shërbimeve
        var ids = dto.ServiceIds.Distinct().ToList();
        foreach (var sid in ids)
        {
            if (!await _repo.ServiceExistsAsync(sid, ct))
                throw new InvalidOperationException($"Service {sid} not found.");
        }

        // 4. Përditësimi i lidhjeve
        emp.ServiceLinks ??= new List<EmployeeServiceRelation>();
        emp.ServiceLinks.Clear();
        
        var now = DateTime.UtcNow;
        foreach (var sid in ids)
        {
            emp.ServiceLinks.Add(new EmployeeServiceRelation
            {
                EmployeeId = emp.Id,
                ServiceId = sid,
                CreatedAt = now,
                CreatedBy = actor,
                UpdatedAt = now,
                UpdatedBy = actor
            });
        }
        emp.UpdatedAt = now;
        emp.UpdatedBy = actor;
        
        await _repo.SaveChangesAsync(ct);
    }

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

    private static EmployeeResponseDto MapEmployee(Employee e) => new()
    {
        Id = e.Id,
        UserId = e.UserId,
        FirstName = e.User?.FirstName ?? "",
        LastName = e.User?.LastName ?? "",
        Email = e.User?.Email ?? "",
        JobTitle = e.JobTitle,
        Phone = e.Phone,
        IsActive = e.IsActive,
        ServiceIds = e.ServiceLinks.Select(l => l.ServiceId).ToList()
    };

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
