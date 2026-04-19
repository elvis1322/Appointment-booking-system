using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;
public class UserResponseDto 
{ 
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
   
   [MaxLength(1)] 
    public string Gjinia { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}