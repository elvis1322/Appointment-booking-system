
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Domain.Interfaces;
using Microsoft.AspNetCore.JsonPatch;


namespace API.Controllers;
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController :ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IUserService _userService;

    public UserController(IUserService userService,IUserRepository userRepository)
    {
        _userService = userService;
        _userRepository = userRepository;
        
    }
    
[HttpGet("GetMe")]
[Authorize]
public async Task<ActionResult<UserProfileDTO>> GetMe()
{
    try
    {
      
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId)) 
            return Unauthorized(new { message = "Token i pavlefshëm" });

       
        if (!Guid.TryParse(userId, out var guidId)) return Unauthorized();

        var userProfile = await _userService.GetUserProfileAsync(guidId);

        return Ok(userProfile);
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound(new { message = ex.Message });
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "Një gabim i papritur ndodhi në server." });
    }
}



[HttpPut("UpdateME")]
public async Task<IActionResult> UpdateMe(UserDTO dto)
{
   
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    var success = await _userService.UpdateProfile(userId, dto);

    if (!success) return BadRequest("An error occurred while updating the profile.");

    return Ok(dto);
}



[HttpPatch("UpdatePartial")]
public async Task<IActionResult> PatchMe([FromBody] JsonPatchDocument<UserDTO> patchDoc)
{
    if (patchDoc == null) return BadRequest();

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

   
    var userDto = await _userService.GetUserForUpdateAsync(userId); 
    if (userDto == null) return NotFound("User not found.");

  
    patchDoc.ApplyTo(userDto, ModelState);

    if (!ModelState.IsValid) return BadRequest(ModelState);

    // 3. Ruhet përmes metodës ekzistuese të update-it
    var success = await _userService.UpdateProfile(userId, userDto);

    if (!success) return BadRequest("Error during update.");

    return Ok("Update was successful!");
}




[HttpPost("change-password")]
public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO model)
{
    var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

    var result = await _userService.ChangePasswordAsync(userId, model.OldPassword, model.NewPassword);

    if (!result) return BadRequest("The old password is incorrect.");

    return Ok("Password changed successfully.");
}


}