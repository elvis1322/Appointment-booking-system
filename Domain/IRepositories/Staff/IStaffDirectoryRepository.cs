using Domain.Entities;

namespace Domain.Interfaces;

public interface IStaffDirectoryRepository
{
    Task<IReadOnlyList<Employee>> GetEmployeesAsync(bool includeInactive, CancellationToken ct = default);
    Task<Employee?> GetEmployeeByIdAsync(Guid id, CancellationToken ct = default);
    Task<Employee?> GetEmployeeByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<Employee?> GetEmployeeForUpdateAsync(Guid id, CancellationToken ct = default);
    Task<Employee?> GetEmployeeWithServicesForUpdateAsync(Guid id, CancellationToken ct = default);
    Task<bool> UserExistsAsync(Guid userId, CancellationToken ct = default);
    Task<bool> ServiceExistsAsync(Guid serviceId, CancellationToken ct = default);
    Task AddEmployeeAsync(Employee employee, CancellationToken ct = default);
    Task LoadEmployeeRelationsAsync(Employee employee, CancellationToken ct = default);
    void RemoveEmployee(Employee employee);

    Task<IReadOnlyList<Location>> GetLocationsAsync(bool includeInactive, CancellationToken ct = default);
    Task<Location?> GetLocationByIdAsync(Guid id, CancellationToken ct = default);
    Task<Location?> GetLocationForUpdateAsync(Guid id, CancellationToken ct = default);
    Task<bool> LocationExistsAsync(Guid id, CancellationToken ct = default);
    Task AddLocationAsync(Location location, CancellationToken ct = default);
    void RemoveLocation(Location location);

    Task<IReadOnlyList<Room>> GetRoomsAsync(Guid? locationId, bool includeInactive, CancellationToken ct = default);
    Task<Room?> GetRoomByIdAsync(Guid id, CancellationToken ct = default);
    Task<Room?> GetRoomForUpdateAsync(Guid id, CancellationToken ct = default);
    Task AddRoomAsync(Room room, CancellationToken ct = default);
    Task LoadRoomLocationAsync(Room room, CancellationToken ct = default);
    void RemoveRoom(Room room);

    Task<bool> SaveChangesAsync(CancellationToken ct = default);
}
