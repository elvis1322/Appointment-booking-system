namespace Application.DTOs;

public class CreateOrderItemDto
{
    public Guid OrderId { get; set; }

    public string Description { get; set; } = "";

    public decimal Price { get; set; } = 0;
}