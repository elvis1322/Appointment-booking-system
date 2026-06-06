namespace Application.DTOs;

public class CreateOrderDto
{
    public Guid AppointmentId { get; set; }

    public decimal TotalAmount { get; set; }
}
