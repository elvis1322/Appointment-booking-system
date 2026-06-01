namespace Domain.Entities;
public class Order : BaseEntity
{
    public Guid Id { get; set; }

    public Guid AppointmentId { get; set; }

    public Guid UserId { get; set; } 

    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = "Pending";

    public User? User { get; set; }
    public Appointment? Appointment { get; set; }
}
