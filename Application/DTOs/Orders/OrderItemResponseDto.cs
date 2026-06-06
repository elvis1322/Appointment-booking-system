public class OrderItemResponseDto
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public string Description { get; set; } = "";

    public decimal Price { get; set; }
}