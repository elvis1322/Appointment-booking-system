namespace Application.DTOs;

public class AppointmentAdminDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public string StatusName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public Guid? ServiceId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
}

