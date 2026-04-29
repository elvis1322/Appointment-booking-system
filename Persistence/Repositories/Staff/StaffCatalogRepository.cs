using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;

namespace Persistence.Repositories;

public class StaffCatalogRepository : IStaffCatalogRepository
{
    private readonly DataContext _db;

    public StaffCatalogRepository(DataContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Service>> GetServicesAsync(Guid? categoryId, bool includeInactive, CancellationToken ct = default)
    {
        var query = _db.Services
            .AsNoTracking()
            .Include(s => s.ServiceCategory)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(s => s.ServiceCategoryId == categoryId.Value);
        }

        if (!includeInactive)
        {
            query = query.Where(s => s.IsActive);
        }

        return await query
            .OrderBy(s => s.ServiceCategory!.SortOrder)
            .ThenBy(s => s.Name)
            .ToListAsync(ct);
    }

    public Task<Service?> GetServiceByIdAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Services
            .AsNoTracking()
            .Include(s => s.ServiceCategory)
            .FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public Task<Service?> GetServiceForUpdateAsync(Guid id, CancellationToken ct = default)
    {
        return _db.Services
            .FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken ct = default)
    {
        return _db.ServiceCategories.AnyAsync(c => c.Id == categoryId, ct);
    }

    public Task AddServiceAsync(Service service, CancellationToken ct = default)
    {
        return _db.Services.AddAsync(service, ct).AsTask();
    }

    public Task LoadServiceCategoryAsync(Service service, CancellationToken ct = default)
    {
        return _db.Entry(service).Reference(s => s.ServiceCategory).LoadAsync(ct);
    }

    public void RemoveService(Service service)
    {
        _db.Services.Remove(service);
    }

    public async Task<bool> SaveChangesAsync(CancellationToken ct = default)
    {
        return await _db.SaveChangesAsync(ct) > 0;
    }
}
