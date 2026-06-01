using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDto>> Register(UserRegisterDto registerDto)
    {
        
      try 
        {
            var user = await _authService.RegisterAsync(registerDto);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponseDto>> Login(UserLoginDto loginDto)
    {
        try 
        {
            var user = await _authService.LoginAsync(loginDto);
            if (user == null) 
    {
        // Kjo do të të japë 401 Unauthorized në Postman
        return Unauthorized(new { message = "Email or password is incorrect." });
    }return Ok(user);
        
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPost("logout")] // Kjo shton "logout" në fund: api/auth/logout
    public async Task<IActionResult> Logout([FromBody] LogoutDto logoutDto)
    {
       try 
    {
        // 1. Thërrasim shërbimin për të bërë IsRevoked = true
        await _authService.LogoutAsync(logoutDto);
        
        // 2. Nëse çdo gjë shkon mirë, kthejmë sukses
        return Ok(new { message = "Logged out successfully." });
    }
    catch (Exception ex)
    {
        // 3. Nëse token-i nuk u gjet (gabimi që po merr), kthejmë mesazhin e saktë
        return BadRequest(new { message = ex.Message });
    }
    }
}

