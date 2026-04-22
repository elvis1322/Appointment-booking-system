
using Application.DTOs;

public interface IUserService
{
    Task<bool> UpdateProfile(string userId, UserDTO model);
Task<UserDTO?> GetUserForUpdateAsync(string userId);

Task<bool> ChangePasswordAsync(Guid userId, string oldPassword, string newPassword);
}