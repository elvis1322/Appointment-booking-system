using Application.DTOs;
using Application.Interfaces;
using Application.Helpers;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Domain.Entities.Constants;
using BCrypt.Net;
namespace Application.Services;

public class AuthService : IAuthService 
{
    private readonly IUserRepository _userRepo;
    private readonly JwtSettings _jwtSettings;
    private readonly IRefreshTokenRepository _tokenRepo;

    public AuthService(IUserRepository userRepo, IRefreshTokenRepository tokenRepo,IOptions<JwtSettings> jwtSettings)
    {
         _userRepo = userRepo;
          _tokenRepo = tokenRepo;
       _jwtSettings = jwtSettings.Value;
    }

    public async Task<UserResponseDto> RegisterAsync(UserRegisterDto registerDto)
    {
     var normalizedEmail = registerDto.Email.ToLower().Trim();
        // 1. Kontrollo nëse përdoruesi ekziston
        var existingUser = await _userRepo.GetByEmailAsync(normalizedEmail);
        if (existingUser != null) throw new Exception("Email already exists.");

        // 2. Hash Password-in
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        // 3. Krijo objektin User
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Email = normalizedEmail,
             Gjinia = registerDto.Gjinia,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
        CreatedBy = normalizedEmail, // Email-i i vetë personit që regjistrohet
        UpdatedAt = DateTime.UtcNow,
        UpdatedBy = normalizedEmail,
           UserRoles = new List<UserRole> 
  { 
        new UserRole { RoleId = AppDefaults.Roles.ClientId ,
              CreatedAt = DateTime.UtcNow,
                CreatedBy = normalizedEmail,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = normalizedEmail


} 
    },
    
     };
        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        // 5. Kthe përgjigjen me Token
        return new UserResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Gjinia = user.Gjinia,
            Token = CreateToken(user)
        };
    }

    public async Task<UserResponseDto> LoginAsync(UserLoginDto loginDto)
    {
        var user = await _userRepo.GetByEmailAsync(loginDto.Email);


if (user == null) {
    Console.WriteLine("Email not found in database!");
    return null; 
}   

bool verify = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
    Console.WriteLine($"--- REZULTATI I BCRYPT: {verify}");
if (!verify) 
    {
        Console.WriteLine("--- Wrong password provided!");
        return null; // NDALON KËTU! Nuk gjeneron token nëse fjalëkalimi është gabim
    }


var accessToken = CreateToken(user);

    // 4. Gjenerojmë një Refresh Token unik (string)
    var refreshTokenValue = Guid.NewGuid().ToString();

    // 5. Krijo objektin e RefreshToken për ta ruajtur në SQL Server
    var refreshTokenEntity = new RefreshToken
    {
        Id = Guid.NewGuid(),
        Token = refreshTokenValue,
        UserId = user.Id,
        ExpiryDate = DateTime.UtcNow.AddDays(7), // Tokeni vlen 1 javë
        CreatedAt = DateTime.UtcNow,
        IsRevoked = false,
        IsUsed = false,
        IsActive = true,
       CreatedBy = user.Email, // Ose "System/Auth" pasi përdoruesi po identifikohet
    UpdatedAt = DateTime.UtcNow,
    UpdatedBy = user.Email

    };

    await _tokenRepo.AddAsync(refreshTokenEntity);
    await _tokenRepo.SaveChangesAsync();
    
 return new UserResponseDto
  {
    Id = user.Id, 
     FirstName = user.FirstName,
     LastName = user.LastName,
     Email = user.Email,
    Gjinia = user.Gjinia,
   Token = accessToken,
          RefreshToken = refreshTokenValue,
          Role = user.UserRoles?.FirstOrDefault()?.Role?.Name ?? "Client"
       
        };
    }
public async Task LogoutAsync(LogoutDto logoutDto)
{
    Console.WriteLine($"Duke kërkuar token-in: {logoutDto.RefreshToken}");
    // 1. Gjejmë token-in në DB
    var refreshToken = await _tokenRepo.GetByTokenAsync(logoutDto.RefreshToken);

    if (refreshToken == null)
    {
        Console.WriteLine("Token not found!");
        throw new Exception("Token not found or invalid.");
    }

    // 2. Markojmë token-in si të revokuar
    refreshToken.IsRevoked = true;
    refreshToken.IsActive = false; 
    
    _tokenRepo.Update(refreshToken);


    await _tokenRepo.SaveChangesAsync();
}



   public string CreateToken(User user)
{
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
       new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.FirstName + " " + user.LastName)
    };

 if (user.UserRoles != null)
    {
        foreach (var userRole in user.UserRoles)
        {
            // 1. Rruga kryesore: Nëse objekti Role është i ngarkuar
            if (userRole.Role != null && !string.IsNullOrEmpty(userRole.Role.Name))
            {
                // SHUMË E RËNDËSISHME: Shto rolin si Claim!
                claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Name));

                // Shto të gjitha Permissions që ka ky Rol
                if (userRole.Role.RolePermissions != null)
                {
                    foreach (var rolePerm in userRole.Role.RolePermissions)
                    {
                        if (rolePerm.Permission != null && !string.IsNullOrEmpty(rolePerm.Permission.Name))
                        {
                            claims.Add(new Claim("permission", rolePerm.Permission.Name));
                        }
                    }
                }
            }
            // 2. Rruga rezervë: Fallback nese Role nuk eshte Include-uar
            else 
            {
                string roleName = string.Empty;
                if (userRole.RoleId == AppDefaults.Roles.AdminId) roleName = "Admin";
                else if (userRole.RoleId == AppDefaults.Roles.EmployeeId) roleName = "Employee";
                else if (userRole.RoleId == AppDefaults.Roles.ClientId) roleName = "Client";

                if (!string.IsNullOrEmpty(roleName))
                {
                    claims.Add(new Claim(ClaimTypes.Role, roleName));
                }
            }
        }
    }

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes),
        SigningCredentials = creds,
        Issuer = _jwtSettings.Issuer,
        Audience = _jwtSettings.Audience
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateToken(tokenDescriptor);

    return tokenHandler.WriteToken(token);
}
}