using Application.DTOs;

namespace Application.Interfaces;

public interface IAuthService
{
    // Metoda për regjistrim - merr DTO dhe kthen Response me Token
    Task<UserResponseDto> RegisterAsync(UserRegisterDto registerDto);

    // Metoda për login - merr Email/Password dhe kthen Response me Token
    Task<UserResponseDto> LoginAsync(UserLoginDto loginDto);
    
    Task LogoutAsync(LogoutDto logoutDto);
    // Metoda opsionale për të gjeneruar Token-in (mund ta bëjmë edhe private në impl)
    string CreateToken(Domain.Entities.User user);
}