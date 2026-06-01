namespace Application.DTOs;

public class UpdateAppointmentDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public Guid StatusId { get; set; }
}
