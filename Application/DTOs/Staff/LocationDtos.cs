namespace Application.DTOs.Staff;

public class LocationResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AddressLine { get; set; }
    public string? City { get; set; }
    public bool IsActive { get; set; }
}

public class CreateUpdateLocationDto
{
    public string Name { get; set; } = string.Empty;
    public string? AddressLine { get; set; }
    public string? City { get; set; }
    public bool IsActive { get; set; } = true;
}

public class RoomResponseDto
{
    public Guid Id { get; set; }
    public Guid LocationId { get; set; }
    public string? LocationName { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? Capacity { get; set; }
    public bool IsActive { get; set; }
}

public class CreateUpdateRoomDto
{
    public Guid LocationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? Capacity { get; set; }
    public bool IsActive { get; set; } = true;
}
