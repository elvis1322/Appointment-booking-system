using System.ComponentModel.DataAnnotations;
namespace Application.DTOs;
public class UserRegisterDto 
{ 
      [Required(ErrorMessage = "Emri është i detyrueshëm")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Emri duhet të jetë mes 2 dhe 50 karaktereve")]
    public string FirstName { get; set; } = string.Empty;

     [Required]
    public string LastName { get; set; } = string.Empty;
[Required]
    [EmailAddress(ErrorMessage = "Email-i nuk është i vlefshëm")]
    public string Email { get; set; } = string.Empty;
   
   [MaxLength(1)] 
    public string Gjinia { get; set; }= string.Empty;
      [Required]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password-i duhet të jetë të paktën 6 karaktere")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", 
        ErrorMessage = "Password-i duhet të ketë një shkronjë të madhe, një të vogël dhe një numër")]
    public string Password { get; set; } = string.Empty;
}