using System.ComponentModel.DataAnnotations;


public class ChangePasswordDTO

{
    [Required(ErrorMessage = "Fjalëkalimi i vjetër kërkohet.")]
    public required string OldPassword { get; set; }
  

    [Required(ErrorMessage = "Fjalëkalimi i ri kërkohet.")]
    [MinLength(8, ErrorMessage = "Fjalëkalimi i ri duhet të jetë të paktën 8 karaktere.")]
    public required string NewPassword { get; set; }
    
    [Required(ErrorMessage = "Konfirmimi i fjalëkalimit kërkohet.")]
    [Compare("NewPassword", ErrorMessage = "Fjalëkalimi i ri dhe konfirmimi nuk përputhen.")]
    public required string ConfirmNewPassword { get; set; }
}