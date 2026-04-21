using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;
public class UserDTO 
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public required  string Email { get; set; }

   [MaxLength(1)] 
    public string? Gjinia { get; set; }
    
}