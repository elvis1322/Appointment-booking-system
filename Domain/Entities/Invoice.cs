namespace Domain.Entities;
    public class Invoice: BaseEntity
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }   
        public Guid PaymentId { get; set; }     
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Pending"; 
    }