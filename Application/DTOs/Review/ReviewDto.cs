namespace Application.DTOs;
public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = "";
    public string UserName { get; set; } = "";
    public string ServiceName { get; set; } = "";
    public string EmployeeName { get; set; } = "";
}