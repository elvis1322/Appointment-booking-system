namespace Domain.Entities;
public class OrderItem:BaseEntity
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; } 

    public string Description { get; set; } = "";
    public decimal Price { get; set; } 
}