
using Domain.Entities;
using Domain.Interfaces;
using Domain.Entities.Constants;
using Application.DTOs;
using Application.Interfaces;
using System.Security.Claims;
using BCrypt.Net;
namespace Application.Services;


public class UserService : IUserService
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository, IRefreshTokenRepository refreshTokenRepository)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<bool> UpdateProfile(string userId, UserDTO model)
    {
        // 1. Konvertojmë ID-në nga string në Guid
        if (!Guid.TryParse(userId, out var guidId))
        {
            return false; 
        }

        // 2. Përdorim metodën tënde: GetByIdAsync(Guid id)
        var user = await _userRepository.GetByIdAsync(guidId);

        if (user == null)
        {
            return false;
        }
        user.FirstName = model.FirstName;
        user.LastName = model.LastName;
        user.Gjinia= model.Gjinia;
        user.Email = model.Email; 

    
        _userRepository.Update(user);

        // 5. Përdorim metodën tënde: SaveChangesAsync()
        // Kjo kthen true nëse u bë të paktën 1 ndryshim në DB
        return await _userRepository.SaveChangesAsync();
    }

public async Task<bool> PatchProfile(string userId, UserDTO model)
{
    if (!Guid.TryParse(userId, out var guidId)) return false;

    var user = await _userRepository.GetByIdAsync(guidId);
    if (user == null) return false;

    // Përditëso vetëm nëse vlera nuk është null ose bosh
    if (!string.IsNullOrEmpty(model.FirstName))
        user.FirstName = model.FirstName;

    if (!string.IsNullOrEmpty(model.LastName))
        user.LastName = model.LastName;

    if (!string.IsNullOrEmpty(model.Email))
        user.Email = model.Email;

    _userRepository.Update(user);
    return await _userRepository.SaveChangesAsync();
}
    
public async Task<UserDTO?> GetUserForUpdateAsync(string userId)
{
    if (!Guid.TryParse(userId, out var guidId)) return null;

    var user = await _userRepository.GetByIdAsync(guidId);
    if (user == null) return null;

    return new UserDTO
    {
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        Gjinia = user.Gjinia
    };
}

public async Task<bool> ChangePasswordAsync(Guid userId, string oldPassword, string newPassword)
{
    var user = await _userRepository.GetByIdAsync(userId);
    if (user == null) return false;

    // 1. Verifiko nëse fjalëkalimi i vjetër është i saktë
    bool isValid = BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash);
    if (!isValid) return false;

    // 2. Krijo Hash-in e ri për fjalëkalimin e ri
    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
 await _refreshTokenRepository.DeleteUserTokensAsync(userId);

    // 3. Ruaj ndryshimet
    return await _userRepository.UpdateAsync(user);
  
}
}