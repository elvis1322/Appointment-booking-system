using Domain.Entities;
using Domain.Interfaces;
using Domain.Entities.Constants;
using Application.DTOs;
using Application.Interfaces;


namespace Application.Services;
    
    public class UADServices :IUADServices
    {
        private readonly IUserRepository _userRepository;
 private readonly IAppointmentRepository _appointmentRepository;


          public UADServices(IUserRepository userRepository, IAppointmentRepository appointmentRepository)
             {
              
               _userRepository = userRepository;
                  _appointmentRepository = appointmentRepository;
            }





public async Task<IEnumerable<UserAdminDTO>> GetUsersSearch(string? searchTerm)
{

    var users = await _userRepository.GetFilteredUsersAsync(searchTerm);

    
    return users.Select(u => new UserAdminDTO
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


    var clientAppointments = await _appointmentRepository.GetByUserIdAsync(id);
    bool hasClientAppointments = clientAppointments.Any(a => 
        a.StatusId == AppDefaults.AppointmentStatus.Pending || 
        a.StatusId == AppDefaults.AppointmentStatus.Confirmed);

    if (hasClientAppointments)
    {
        throw new InvalidOperationException("register.errors.userHasClientAppointments");
    }


    var employeeAppointments = await _appointmentRepository.GetByEmployeeUserIdAsync(id);
    bool hasEmployeeAppointments = employeeAppointments.Any(a => 
        a.StatusId == AppDefaults.AppointmentStatus.Pending || 
        a.StatusId == AppDefaults.AppointmentStatus.Confirmed);

    if (hasEmployeeAppointments)
    {
        throw new InvalidOperationException("register.errors.userHasEmployeeAppointments");
    }

   
    return await _userRepository.DeleteAsync(id);
}

public async Task<UserAdminDTO> UpdateUser(UserAdminDTO userDto)
{
   
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
