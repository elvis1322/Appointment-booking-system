using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using API.Hubs;

namespace API.Controllers;

[Authorize(Roles = "Employee")]
[ApiController]
[Route("api/[controller]")]
public class EmployeeAppointmentsController : ControllerBase
{
    private readonly IAppointmentUserService _appointmentService;
    private readonly IAppointmentAdminService _adminService;
    private readonly IHubContext<NotificationHub> _notificationHub;

    public EmployeeAppointmentsController(IAppointmentUserService appointmentService, IAppointmentAdminService adminService, IHubContext<NotificationHub> notificationHub)
    {
        _appointmentService = appointmentService;
        _adminService = adminService;
        _notificationHub = notificationHub;
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
        // Përdorim logjikën e adminit për të përditësuar statusin
        var result = await _adminService.ChangeStatus(id, dto);
        await _notificationHub.Clients.All.SendAsync("ReceiveNotification", new { title = "SYSTEM_UPDATE", message = "appointments", createdAt = DateTime.UtcNow });
        return Ok(result);
    }

    // DELETE APPOINTMENT (EMPLOYEE)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _adminService.DeleteAppointment(id);
        if (!result)
            return NotFound(new { message = "Appointment not found" });
        await _notificationHub.Clients.All.SendAsync("ReceiveNotification", new { title = "SYSTEM_UPDATE", message = "appointments", createdAt = DateTime.UtcNow });
        return Ok(new { message = "Appointment deleted successfully" });
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token.");
        return Guid.Parse(userIdClaim);
    }
}
