namespace Domain.Entities;
public class Appointment:BaseEntity
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; } 

    public User User { get; set; } = null!;

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public Guid StatusId { get; set; }
    public AppointmentStatus Status { get; set; } = null!;
    public Guid? ServiceId { get; set; }
    public Service? Service { get; set; }
    
    public Guid? EmployeeId { get; set; }
    public Employee? Employee { get; set; }
}