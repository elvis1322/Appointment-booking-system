using Domain.Entities.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.Interfaces;
using API.Security;

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
    [HasPermission("Users:Read")]
public async Task<ActionResult<IEnumerable<UserAdminDTO>>> GetAllUsers([FromQuery] string? term) 
{  
      var users = await _uadServices.GetUsersSearch(term);

    if (users == null || !users.Any())
    {
        return NotFound("User not found.");
    }
    return Ok(users);
}


    [HttpGet("GetUserById/{id}")]
     [HasPermission("Users:Read")]
public async Task<ActionResult<UserAdminDTO>> GetUsersbyId(Guid id)
    { 

        var user=await _uadServices.GetUserById(id);
        if (user==null)
        {
            return NotFound("User not found.");
        }

      return Ok(user);

    }


    [HttpDelete("DeleteUserById/{id}")]
        [HasPermission("Users:Delete")]
public async Task<ActionResult<UserAdminDTO>> DeleteUserById(Guid id){
   try
    {
        var userDeleted = await _uadServices.DeleteUser(id);
        if (!userDeleted)
        {
            return NotFound("User not found.");
        }

        return Ok(new { message = "User deleted successfully." });
    }
    catch (InvalidOperationException ex)
    {
    
        return BadRequest(ex.Message);
    }
    catch (Exception ex)
    {
        
        return StatusCode(500, "Ndodhi një gabim i papritur në server.");
    }
}

  
    [HttpPut("UpdateUserById/{id}")]
    [HasPermission("Users:Update")]
public async Task<ActionResult<UserAdminDTO>> UpdateUserById(Guid id,[FromBody] UserAdminDTO userDto)
    {   try 
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
   [HasPermission("Users:Create")]
public async Task<ActionResult<UserAdminDTO>> CreateClient([FromBody] UserAdminDTO userDto)
    { 
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
   [HasPermission("Users:Create")]
public async Task<ActionResult<UserAdminDTO>> CreateEmployee([FromBody] UserAdminDTO userDto)
    {
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