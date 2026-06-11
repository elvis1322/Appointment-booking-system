using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Persistence.Data;
using API.Security;
using System.Security.Claims;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentUserService _appointmentService;

    public AppointmentsController(IAppointmentUserService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    //  CREATE APPOINTMENT
    [HttpPost("create")]
    public async Task<IActionResult> Create(CreateAppointmentUserDto dto)
    {
        var userId = GetUserId();

        try
        {
            var result = await _appointmentService.Create(userId, dto);

            return Ok(new
            {
                message = "Termini u krijua me sukses",
                data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    //  GET ALL MY APPOINTMENTS
    [HttpGet("GetMyAppointments")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var userId = GetUserId();
        var appointments = await _appointmentService.GetMyAppointments(userId);

        return Ok(new
        {
            message = "Lista e termineve u mor me sukses",
            data = appointments
        });
    }

    //GET BY ID
    [HttpGet("GetByIdMyAppointments/{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        var appointment = await _appointmentService.GetById(id, userId);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Termini nuk u gjet ose nuk keni autorizim"
            });
        }

        return Ok(new
        {
            message = "Termini u gjet me sukses",
            data = appointment
        });
    }

    //  CANCEL APPOINTMENT
    [HttpPost("cancelmyAppointment/{id}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var userId = GetUserId();
        var result = await _appointmentService.Cancel(id, userId);

        if (!result)
        {
            return BadRequest(new
            {
                message = "Nuk mund të anulohet ky termin"
            });
        }

        return Ok(new
        {
            message = "Termini u anulua me sukses"
        });
    }

    // Helper për userId nga token
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("ID e përdoruesit nuk u gjet në token.");

        return Guid.Parse(userIdClaim);
    }
}