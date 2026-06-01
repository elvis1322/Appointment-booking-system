using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Authorize(Roles = "Employee")]
[ApiController]
[Route("api/[controller]")]
public class EmployeeAppointmentsController : ControllerBase
{
    private readonly IAppointmentUserService _appointmentService;
    private readonly IAppointmentAdminService _adminService;

    public EmployeeAppointmentsController(IAppointmentUserService appointmentService, IAppointmentAdminService adminService)
    {
        _appointmentService = appointmentService;
        _adminService = adminService;
    }

    // GET ALL APPOINTMENTS FOR LOGGED IN EMPLOYEE
    [HttpGet("MyAppointments")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var userId = GetUserId();
        var appointments = await _appointmentService.GetEmployeeAppointments(userId);
        return Ok(new
        {
            message = "Employee appointments retrieved successfully",
            data = appointments
        });
    }

    // UPDATE APPOINTMENT STATUS (EMPLOYEE)
    [HttpPut("{id}/status")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeAppointmentStatusDTO dto)
    {
        var result = await _adminService.ChangeStatus(id, dto);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token.");
        return Guid.Parse(userIdClaim);
    }
}
