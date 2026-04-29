using Application.DTOs.Staff;

namespace Application.Interfaces;

public interface IStaffCatalogService
{   
    Task<IReadOnlyList<ServiceResponseDto>> GetServicesAsync(Guid? categoryId, bool includeInactive, CancellationToken ct = default);
    Task<ServiceResponseDto?> GetServiceByIdAsync(Guid id, CancellationToken ct = default);
    Task<ServiceResponseDto> CreateServiceAsync(CreateUpdateServiceDto dto, string? actor, CancellationToken ct = default);
    Task<ServiceResponseDto?> UpdateServiceAsync(Guid id, CreateUpdateServiceDto dto, string? actor, CancellationToken ct = default);
    Task<bool> DeleteServiceAsync(Guid id, CancellationToken ct = default);
}
