using Domain.Entities;
using Domain.Interfaces;
using Domain.Entities.Constants;
using Application.DTOs;


namespace Application.Services;
    
    public class UADServices 
    {
        private readonly IUserRepository _userRepository;

          public UADServices(IUserRepository userRepository)
             {
               _userRepository = userRepository;
                }


// Në UADServices
public async Task<IEnumerable<UserAdminDTO>> GetUsers(string? searchTerm)
{
    // 1. Merri të gjithë (Kujdes: Kjo i shkarkon të gjithë në RAM)
    var allUsers = await _userRepository.GetAllAsync();
    var query = allUsers.AsQueryable();

    // 2. Filtro listën në memorie
    if (!string.IsNullOrWhiteSpace(searchTerm))
    {
        string term = searchTerm.Trim().ToLower();

        query = query.Where(u =>  
         u.Id.ToString().ToLower().StartsWith(term)||
            (u.FirstName != null && u.FirstName.ToLower().StartsWith(term)) || 
            (u.LastName != null && u.LastName.ToLower().StartsWith(term)) 
          //  (u.Email != null && u.Email.ToLower().Contains(term))
           );
    }

    // 3. Mapimi në DTO
    return query.Select(u => new UserAdminDTO
    {
        Id = u.Id,
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        Gjinia = u.Gjinia,
        RoleId = u.UserRoles.Select(ur => ur.RoleId).FirstOrDefault(),
    RoleName = u.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault() ?? "Pa Rol"
     }).ToList();
}


public async Task<IEnumerable<UserAdminDTO>> GetUsersSearch(string? searchTerm)
{
    // 1. Marrim të gjithë përdoruesit me rolet e tyre
    var users = await _userRepository.GetAllAsync();
    var query = users.AsQueryable();

    // 2. Nëse përdoruesi ka shkruar diçka, apliko kërkimin "Universal"
    if (!string.IsNullOrWhiteSpace(searchTerm))
    {
        string term = searchTerm.Trim().ToLower();

        query = query.Where(u => 
            // Kërko në ID
            u.Id.ToString().ToLower().StartsWith(term) || 
            // Kërko në Emër
            (u.FirstName != null && u.FirstName.ToLower().StartsWith(term)) || 
            (u.LastName != null && u.LastName.ToLower().StartsWith(term)) ||
            // Kërko në Email
            (u.Email != null && u.Email.ToLower().Contains(term)) || 
            // Kërko në Gjini
            (u.Gjinia != null && u.Gjinia.ToLower() == term) ||
            // Kërko në Emrin e Rolit
            u.UserRoles.Any(ur => ur.Role != null && ur.Role.Name.ToLower().StartsWith(term))
        );
    }

    // 3. Mapimi në DTO
    return query.Select(u => new UserAdminDTO
    {
        Id = u.Id,
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        Gjinia = u.Gjinia,
       RoleId = u.UserRoles.Select(ur => ur.RoleId).FirstOrDefault(),
    RoleName = u.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault() ?? "No Role"
     }).ToList();
}
    




public async Task<UserAdminDTO> GetUserById(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new Exception("User not found.");

        return new UserAdminDTO
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Gjinia = user.Gjinia,
            RoleId = user.UserRoles.FirstOrDefault()?.RoleId ?? Guid.Empty,
            RoleName = user.UserRoles.FirstOrDefault()?.Role?.Name ?? "No Role"
        };
    }



  public async Task<bool> DeleteUser(Guid id)
{
    var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;

    return await _userRepository.DeleteAsync(id);
}

public async Task<UserAdminDTO> UpdateUser(UserAdminDTO userDto)
{
    // 1. Gjejmë përdoruesin ekzistues nga databaza (përmes Repository)
    var existingUser = await _userRepository.GetByIdAsync(userDto.Id);

    if (existingUser == null)
    {
        throw new Exception("User not found.");
    }
    //if (userDto.RoleId == AppDefaults.Roles.AdminId) 
//{
 //   throw new Exception("Nuk lejohet caktimi i rolit Admin përmes këtij paneli.");
//}
    // 2. Përditësojmë vetëm fushat që lejohen
   
    existingUser.FirstName = userDto.FirstName;
    existingUser.LastName = userDto.LastName;
    existingUser.Email = userDto.Email;
    existingUser.Gjinia = userDto.Gjinia;
    existingUser.UpdatedAt = DateTime.UtcNow;
    existingUser.UpdatedBy = "Admin";
    var userRole = existingUser.UserRoles.FirstOrDefault();
    if ( userDto.RoleId != Guid.Empty)
        {
            existingUser.UserRoles.Clear();
        // Shtojmë rolin e ri
        existingUser.UserRoles.Add(new UserRole 
        { 
            UserId = existingUser.Id, 
            RoleId = userDto.RoleId ,
            CreatedAt = DateTime.UtcNow, 
            CreatedBy = "Admin",
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = "Admin"

        });
        }
    _userRepository.Update(existingUser);

    // 4. Ruajmë ndryshimet
    await _userRepository.SaveChangesAsync();
    var updatedUser = await _userRepository.GetByIdAsync(existingUser.Id);
    var currentRole = updatedUser.UserRoles.FirstOrDefault()?.Role;

    userDto.RoleName = currentRole?.Name ?? "No Role";
    userDto.RoleId = currentRole?.Id ?? Guid.Empty;

    return userDto;
    
}

public async Task<UserAdminDTO> AddClient(UserAdminDTO userDto)
{
 

var existingUser = await _userRepository.GetByEmailAsync(userDto.Email);
    if (existingUser != null)
    {
        throw new Exception("Email already exists.");
    }
    string passwordToHash ="Client123!";
 var klientRoleId = AppDefaults.Roles.ClientId;
    var newUser = new User
    {
        Id = Guid.NewGuid(),
        FirstName = userDto.FirstName,
        LastName = userDto.LastName,
        Email = userDto.Email,
        Gjinia = userDto.Gjinia,
         CreatedAt = DateTime.UtcNow, 
        CreatedBy = "Admin",
        UpdatedAt = DateTime.UtcNow, 
        UpdatedBy = "Admin",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordToHash),
        UserRoles = new List<UserRole>

        {
            new UserRole { RoleId = AppDefaults.Roles.ClientId,
            CreatedAt = DateTime.UtcNow,
                CreatedBy = "Admin",
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = "Admin"
          } 
        }

};
await _userRepository.AddAsync(newUser);
    await _userRepository.SaveChangesAsync();
    userDto.Id = newUser.Id;
userDto.RoleId = klientRoleId;
    userDto.RoleName = "Client";
    return userDto;
}

public async Task<UserAdminDTO> AddEmployee(UserAdminDTO userDto)
{
var existingUser = await _userRepository.GetByEmailAsync(userDto.Email);
    if (existingUser != null)
    {
        throw new Exception("Email already exists.");
    }
 string passwordToHash ="Employee123!";
 var punonjesiRoleId = AppDefaults.Roles.EmployeeId;
    var newUser = new User
    {
        Id = Guid.NewGuid(),
        FirstName = userDto.FirstName,
        LastName = userDto.LastName,
        Email = userDto.Email,
        Gjinia = userDto.Gjinia,
         CreatedAt = DateTime.UtcNow, 
        CreatedBy = "Admin",
        UpdatedAt = DateTime.UtcNow, 
        UpdatedBy = "Admin",
         PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordToHash),
    
        UserRoles = new List<UserRole>
{       new UserRole {
RoleId = AppDefaults.Roles.EmployeeId,
CreatedAt = DateTime.UtcNow,
CreatedBy = "Admin",
UpdatedAt = DateTime.UtcNow,
UpdatedBy = "Admin"}  }
};
    await _userRepository.AddAsync(newUser);
    await _userRepository.SaveChangesAsync();

userDto.Id = newUser.Id;
userDto.RoleId = punonjesiRoleId;
userDto.RoleName = "Employee";
    return userDto;
}




    }
