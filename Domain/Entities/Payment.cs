namespace Domain.Entities;
 public class Payment:BaseEntity
 {
        public Guid Id { get; set; } 
        public Guid OrderId { get; set; } 
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } ="Stripe";
        public string? StripePaymentIntentId{ get; set; } 
        public string Status { get; set; } = "Pending";
}

