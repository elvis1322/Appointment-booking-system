namespace Application.DTOs;

public class OrderResponseDto
{
    public Guid Id { get; set; }

    public Guid AppointmentId { get; set; }
    public Guid UserId { get; set; }
    public decimal TotalAmount { get; set; }

    public string Status { get; set; }="Pending";

    public string UserName { get; set; } = "";
}