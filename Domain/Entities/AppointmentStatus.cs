namespace Domain.Entities;

public class AppointmentStatus:BaseEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;

    public ICollection<Appointment> Appointments { get; set; }
        = new List<Appointment>();
}
