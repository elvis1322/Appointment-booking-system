 namespace Application.DTOs;
public class CreateAppointmentUserDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public Guid ServiceId { get; set; }
    public Guid EmployeeId { get; set; }
}