namespace Domain.Entities;

public class Review : BaseEntity
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; } 
    public Guid UserId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = "";
    public User? User { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public string ServiceName { get; set; } = "";

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public string EmployeeName { get; set; } = "";
}