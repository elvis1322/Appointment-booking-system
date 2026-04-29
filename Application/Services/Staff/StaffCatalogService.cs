using Application.DTOs.Staff;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services.Staff;

public class StaffCatalogService : IStaffCatalogService
{
    private readonly IStaffCatalogRepository _repo;

    public StaffCatalogService(IStaffCatalogRepository repo) => _repo = repo;

   
    public async Task<IReadOnlyList<ServiceResponseDto>> GetServicesAsync(Guid? categoryId, bool includeInactive, CancellationToken ct = default)
    {
        var list = await _repo.GetServicesAsync(categoryId, includeInactive, ct);
        return list.Select(MapService).ToList();
    }

    public async Task<ServiceResponseDto?> GetServiceByIdAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetServiceByIdAsync(id, ct);
        return e == null ? null : MapService(e);
    }

    public async Task<ServiceResponseDto> CreateServiceAsync(CreateUpdateServiceDto dto, string? actor, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) throw new ArgumentException("Name is required.");
        if (dto.DurationMinutes < 1) throw new ArgumentException("Duration must be at least 1 minute.");
        var catExists = await _repo.CategoryExistsAsync(dto.ServiceCategoryId, ct);
        if (!catExists) throw new InvalidOperationException("Service category not found.");
        var now = DateTime.UtcNow;
        var e = new Service
        {
            Id = Guid.NewGuid(),
            ServiceCategoryId = dto.ServiceCategoryId,
            Name = dto.Name.Trim(),
            Description = dto.Description,
            DurationMinutes = dto.DurationMinutes,
            Price = dto.Price,
            IsActive = dto.IsActive,
            CreatedAt = now,
            CreatedBy = actor,
            UpdatedAt = now,
            UpdatedBy = actor
        };
        await _repo.AddServiceAsync(e, ct);
        await _repo.SaveChangesAsync(ct);
        await _repo.LoadServiceCategoryAsync(e, ct);
        return MapService(e);
    }

    public async Task<ServiceResponseDto?> UpdateServiceAsync(Guid id, CreateUpdateServiceDto dto, string? actor, CancellationToken ct = default)
    {
        var e = await _repo.GetServiceForUpdateAsync(id, ct);
        if (e == null) return null;
        if (string.IsNullOrWhiteSpace(dto.Name)) throw new ArgumentException("Name is required.");
        if (dto.DurationMinutes < 1) throw new ArgumentException("Duration must be at least 1 minute.");
        var catExists = await _repo.CategoryExistsAsync(dto.ServiceCategoryId, ct);
        if (!catExists) throw new InvalidOperationException("Service category not found.");
        e.ServiceCategoryId = dto.ServiceCategoryId;
        e.Name = dto.Name.Trim();
        e.Description = dto.Description;
        e.DurationMinutes = dto.DurationMinutes;
        e.Price = dto.Price;
        e.IsActive = dto.IsActive;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = actor;
        await _repo.SaveChangesAsync(ct);
        await _repo.LoadServiceCategoryAsync(e, ct);
        return MapService(e);
    }

    public async Task<bool> DeleteServiceAsync(Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetServiceForUpdateAsync(id, ct);
        if (e == null) return false;
        _repo.RemoveService(e);
        await _repo.SaveChangesAsync(ct);
        return true;
    }

    

    private static ServiceResponseDto MapService(Service s) => new()
    {
        Id = s.Id,
        ServiceCategoryId = s.ServiceCategoryId,
        ServiceCategoryName = s.ServiceCategory?.Name,
        Name = s.Name,
        Description = s.Description,
        DurationMinutes = s.DurationMinutes,
        Price = s.Price,
        IsActive = s.IsActive
    };
}
