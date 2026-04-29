using Domain.Entities;

namespace Domain.Interfaces;

public interface IStaffCatalogRepository
{
    Task<IReadOnlyList<Service>> GetServicesAsync(Guid? categoryId, bool includeInactive, CancellationToken ct = default);
    Task<Service?> GetServiceByIdAsync(Guid id, CancellationToken ct = default);
    Task<Service?> GetServiceForUpdateAsync(Guid id, CancellationToken ct = default);
    Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken ct = default);
    Task AddServiceAsync(Service service, CancellationToken ct = default);
    Task LoadServiceCategoryAsync(Service service, CancellationToken ct = default);
    void RemoveService(Service service);

    Task<bool> SaveChangesAsync(CancellationToken ct = default);
}
