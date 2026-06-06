namespace Application.DTOs;
public class CreateReviewDto
{
    public Guid AppointmentId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = "";
}