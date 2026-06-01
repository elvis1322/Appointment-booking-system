namespace Application.DTOs.Staff;

public class ServiceResponseDto
{
    public Guid Id { get; set; }
    public Guid ServiceCategoryId { get; set; }
    public string? ServiceCategoryName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
}

public class CreateUpdateServiceDto
{
    public Guid ServiceCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}
