namespace Application.DTOs.Staff;

public class EmployeeResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public IReadOnlyList<Guid> ServiceIds { get; set; } = Array.Empty<Guid>();
}

public class CreateEmployeeDto
{
    public Guid UserId { get; set; }
    public string? JobTitle { get; set; }
    public string? Phone { get; set; }
}

public class UpdateEmployeeDto
{
    public string? JobTitle { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
}

public class AssignEmployeeServicesDto
{
    public IReadOnlyList<Guid> ServiceIds { get; set; } = Array.Empty<Guid>();
}
