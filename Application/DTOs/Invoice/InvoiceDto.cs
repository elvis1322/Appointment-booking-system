namespace Application.DTOs;
    public class InvoiceDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid PaymentId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = null!;
    }