using Domain.Entities.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.Interfaces;
namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] 
public class AdminController : ControllerBase
{
    private readonly IUADServices _uadServices;
    public AdminController(IUADServices uadServices)
    {
        _uadServices = uadServices;
    }




    [HttpGet("GetAllUsers")]
public async Task<ActionResult<IEnumerable<UserAdminDTO>>> GetAllUsers(
    [FromQuery] string? term) 
{

if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Read"))
        return Forbid();

    try
    {
        var users = await _uadServices.GetUsersSearch(term);
        
        if (users == null || !users.Any())
        {
            return NotFound("User not found.");
        }

        return Ok(users);
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error: {ex.Message}");
    }
}

    [HttpGet("GetUserById/{id}")]
public async Task<ActionResult<UserAdminDTO>> GetUsersbyId(Guid id)
    { 
  if(!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Read"))
    {
        return Forbid("You do not have permission to view user details.");
    }

        var user=await _uadServices.GetUserById(id);
        if (user==null)
        {
            return NotFound("User not found.");
        }

      return Ok(user);

    }


    [HttpDelete("DeleteUserById/{id}")]
public async Task<ActionResult<UserAdminDTO>> DeleteUserById(Guid id)
    {
          var kaLeje = User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Delete");

       if (!kaLeje)
      {
       
     return Forbid("You do not have permission to delete users.");
    }


        var user=await _uadServices.DeleteUser(id);
        if (!user)
        {
            return NotFound("User not found.");
        }

      return Ok(new { message = "User deleted successfully." });

    }

  
    [HttpPut("UpdateUserById/{id}")]
public async Task<ActionResult<UserAdminDTO>> UpdateUserById(Guid id,[FromBody] UserAdminDTO userDto)
    {  
        if(!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Update"))
    {
        return Forbid("You do not have permission to update users.");
    }

        try 
    {
          userDto.Id = id;
        var user = await _uadServices.UpdateUser(userDto); 
        return Ok(user);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }

    }

  [HttpPost("CreateClient")]
public async Task<ActionResult<UserAdminDTO>> CreateClient([FromBody] UserAdminDTO userDto)
    {
        if(!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Create"))
    {
        return Forbid("You do not have permission to create users.");
    }
        try 
    {
          
        var user = await _uadServices.AddClient(userDto); 
        return Ok(user);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}

  [HttpPost("CreateEmployee")]
public async Task<ActionResult<UserAdminDTO>> CreateEmployee([FromBody] UserAdminDTO userDto)
    {
         if(!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Create"))
    {
        return Forbid("You do not have permission to create users.");
    }
        try 
    {
          
        var user = await _uadServices.AddEmployee(userDto); 
        return Ok(user);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}


}