namespace Application.DTOs;
public class PaymentResponseDto

{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = null!;
    public string ClientSecret { get; set; } =null!;
}