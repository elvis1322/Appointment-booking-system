using Domain.Entities.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Services;
namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] 
public class AdminController : ControllerBase
{




    [HttpGet("GetAllUsers")]
public async Task<ActionResult<IEnumerable<UserAdminDTO>>> GetAllUsers(
    [FromServices] UADServices uadServices, 
    [FromQuery] string? term) // Vetëm një parametër 'term'
{

if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Read"))
        return Forbid();

    try
    {
        var users = await uadServices.GetUsersSearch(term);
        
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
public async Task<ActionResult<UserAdminDTO>> GetUsersbyId(Guid id,[FromServices] UADServices uadServices)
    { 
  if(!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Read"))
    {
        return Forbid("You do not have permission to view user details.");
    }

        var user=await uadServices.GetUserById(id);
        if (user==null)
        {
            return NotFound("User not found.");
        }

      return Ok(user);

    }


    [HttpDelete("DeleteUserById/{id}")]
public async Task<ActionResult<UserAdminDTO>> DeleteUserById(Guid id,[FromServices] UADServices uadServices)
    {
          var kaLeje = User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Delete");

       if (!kaLeje)
      {
        // Nëse nuk e ka lejen, kthyejmë 403 Forbidden
     return Forbid("You do not have permission to delete users.");
    }


        var user=await uadServices.DeleteUser(id);
        if (!user)
        {
            return NotFound("User not found.");
        }

      return Ok(new { message = "User deleted successfully." });

    }

  
    [HttpPut("UpdateUserById/{id}")]
public async Task<ActionResult<UserAdminDTO>> UpdateUserById(Guid id,[FromBody] UserAdminDTO userDto,[FromServices] UADServices uadServices)
    {  
        if(!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Update"))
    {
        return Forbid("You do not have permission to update users.");
    }

        try 
    {
          userDto.Id = id;
        var user = await uadServices.UpdateUser(userDto); 
        return Ok(user);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }

    }

  [HttpPost("CreateClient")]
public async Task<ActionResult<UserAdminDTO>> CreateClient([FromBody] UserAdminDTO userDto,[FromServices] UADServices uadServices)
    {
        if(!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Create"))
    {
        return Forbid("You do not have permission to create users.");
    }
        try 
    {
          
        var user = await uadServices.AddClient(userDto); 
        return Ok(user);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}

  [HttpPost("CreateEmployee")]
public async Task<ActionResult<UserAdminDTO>> CreateEmployee([FromBody] UserAdminDTO userDto,[FromServices] UADServices uadServices)
    {
         if(!User.Claims.Any(c => c.Type == "permission" && c.Value == "Users:Create"))
    {
        return Forbid("You do not have permission to create users.");
    }
        try 
    {
          
        var user = await uadServices.AddEmployee(userDto); 
        return Ok(user);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}


}