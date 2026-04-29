using Application.DTOs;

namespace Application.Interfaces;

public interface IUADServices
{
  
    Task<IEnumerable<UserAdminDTO>> GetUsers(string? searchTerm);
    Task<IEnumerable<UserAdminDTO>> GetUsersSearch(string? searchTerm);
    Task<UserAdminDTO> GetUserById(Guid id);
    Task<UserAdminDTO> UpdateUser(UserAdminDTO userDto);
    Task<bool> DeleteUser(Guid id);
    Task<UserAdminDTO> AddClient(UserAdminDTO userDto);
    Task<UserAdminDTO> AddEmployee(UserAdminDTO userDto);
}