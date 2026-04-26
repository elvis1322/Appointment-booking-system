
public class UserProfileDTO 
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Gjinia { get; set; }
    public List<string> Roles { get; set; } = new();
}