using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Persistence.Security;

namespace API.Controllers.Appointments;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AppointmentsAdminController : ControllerBase
{
    private readonly IAppointmentAdminService _service;

    public AppointmentsAdminController(IAppointmentAdminService service)
    {
        _service = service;
    }

    //  GET ALL APPOINTMENTS
    [HttpGet("GetAllAppointments")]
    [HasPermission("Appointments:Read")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAppointments();
        return Ok(result);
    }
    //  GET APPOINTMENT BY ID
    [HttpGet("GetAppointmentById/{id}")]
    [HasPermission("Appointments:Read")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetById(id);

        if (result == null)
            return NotFound("Appointment not found");

        return Ok(result);
    }
    //  CREATE APPOINTMENT
    [HttpPost("CreateAppointment")]
    [HasPermission("Appointments:Create")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        if (dto == null)
            return BadRequest("Invalid data");

        var result = await _service.Create(dto);
        return Ok(result);
    }

    //  UPDATE APPOINTMENT STATUS
    [HttpPut("{id}/status")]
    [HasPermission("Appointments:Update")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeAppointmentStatusDTO dto)
    {
        var result = await _service.ChangeStatus(id, dto);
        return Ok(result);
    }
    //  DELETE APPOINTMENT
    [HttpDelete("DeleteAppointment/{id}")]
    [HasPermission("Appointments:Delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _service.DeleteAppointment(id);

        if (!result)
            return NotFound();

        return Ok("Deleted successfully");
    }
}