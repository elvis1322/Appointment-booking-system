namespace Application.DTOs;

public class CreateAppointmentDto
{
    public Guid UserId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public Guid ServiceId { get; set; }
}
