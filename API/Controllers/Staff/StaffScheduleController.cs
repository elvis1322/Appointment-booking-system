using API;
using Application.DTOs.Staff;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Staff;

[ApiController]
[Route("api/staff-schedule")]
public class StaffScheduleController : ControllerBase
{
    // --- Working hours ---
    [HttpGet("employees/{employeeId:guid}/working-hours")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<WorkingHourResponseDto>>> GetWorkingHours(
        [FromServices] IStaffScheduleService svc,
        Guid employeeId,
        CancellationToken ct = default)
    {
        try
        {
            return Ok(await svc.GetWorkingHoursAsync(employeeId, ct));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("working-hours/{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<WorkingHourResponseDto>> GetWorkingHourById(
        [FromServices] IStaffScheduleService svc,
        Guid id,
        CancellationToken ct = default)
    {
        var e = await svc.GetWorkingHourByIdAsync(id, ct);
        return e == null ? NotFound() : Ok(e);
    }

    [HttpPost("employees/{employeeId:guid}/working-hours")]
    // [Authorize(Roles = "Admin")] // Komentuar për testim ngase s'kemi login
    public async Task<ActionResult<WorkingHourResponseDto>> AddWorkingHour(
        [FromServices] IStaffScheduleService svc,
        Guid employeeId,
        [FromBody] CreateUpdateWorkingHourDto dto,
        CancellationToken ct = default)
    {
        try
        {
            var created = await svc.AddWorkingHourAsync(employeeId, dto, StaffAuditHelper.Actor(User), ct);
            return CreatedAtAction(nameof(GetWorkingHourById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("working-hours/{id:guid}")]
    // [Authorize(Roles = "Admin")] // Komentuar për testim
    public async Task<ActionResult<WorkingHourResponseDto>> UpdateWorkingHour(
        [FromServices] IStaffScheduleService svc,
        Guid id,
        [FromBody] CreateUpdateWorkingHourDto dto,
        CancellationToken ct = default)
    {
        try
        {
            var e = await svc.UpdateWorkingHourAsync(id, dto, StaffAuditHelper.Actor(User), ct);
            return e == null ? NotFound() : Ok(e);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("working-hours/{id:guid}")]
    // [Authorize(Roles = "Admin")] // Komentuar për testim
    public async Task<IActionResult> DeleteWorkingHour(
        [FromServices] IStaffScheduleService svc,
        Guid id,
        CancellationToken ct = default)
    {
        var ok = await svc.DeleteWorkingHourAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }

    // --- Days off ---
    [HttpGet("employees/{employeeId:guid}/days-off")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<DayOffResponseDto>>> GetDaysOff(
        [FromServices] IStaffScheduleService svc,
        Guid employeeId,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Schedules:Read"))
            return Forbid();
        try
        {
            return Ok(await svc.GetDaysOffAsync(employeeId, ct));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("days-off/{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<DayOffResponseDto>> GetDayOffById(
        [FromServices] IStaffScheduleService svc,
        Guid id,
        CancellationToken ct = default)
    {
        var e = await svc.GetDayOffByIdAsync(id, ct);
        return e == null ? NotFound() : Ok(e);
    }

    [HttpPost("employees/{employeeId:guid}/days-off")]
    // [Authorize(Roles = "Admin")] // Komentuar për testim ngase s'kemi login
    public async Task<ActionResult<DayOffResponseDto>> AddDayOff(
        [FromServices] IStaffScheduleService svc,
        Guid employeeId,
        [FromBody] CreateUpdateDayOffDto dto,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Schedules:Update"))
            return Forbid();
        try
        {
            var created = await svc.AddDayOffAsync(employeeId, dto, StaffAuditHelper.Actor(User), ct);
            return CreatedAtAction(nameof(GetDayOffById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("days-off/{id:guid}")]
    // [Authorize(Roles = "Admin")] // Komentuar për testim
    public async Task<ActionResult<DayOffResponseDto>> UpdateDayOff(
        [FromServices] IStaffScheduleService svc,
        Guid id,
        [FromBody] CreateUpdateDayOffDto dto,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Schedules:Update"))
            return Forbid();
        try
        {
            var e = await svc.UpdateDayOffAsync(id, dto, StaffAuditHelper.Actor(User), ct);
            return e == null ? NotFound() : Ok(e);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("days-off/remove/{id:guid}")]
    // [Authorize(Roles = "Admin")] // Komentuar për testim
    public async Task<IActionResult> DeleteDayOff(
        [FromServices] IStaffScheduleService svc,
        Guid id,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Schedules:Update"))
            return Forbid();
        var ok = await svc.DeleteDayOffAsync(id, ct);
        return ok ? NoContent() : BadRequest($"Dita e pushimit me ID {id} nuk u gjet në databazë.");
    }

    // --- Schedules ---
    [HttpGet("employees/{employeeId:guid}/schedules")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ScheduleResponseDto>>> GetSchedules(
        [FromServices] IStaffScheduleService svc,
        Guid employeeId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct = default)
    {
        try
        {
            return Ok(await svc.GetSchedulesAsync(employeeId, from, to, ct));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("schedules/{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ScheduleResponseDto>> GetScheduleById(
        [FromServices] IStaffScheduleService svc,
        Guid id,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Schedules:Read"))
            return Forbid();
        var e = await svc.GetScheduleByIdAsync(id, ct);
        return e == null ? NotFound() : Ok(e);
    }

    [HttpPost("employees/{employeeId:guid}/schedules")]
    // [Authorize(Roles = "Admin")] // Komentuar për testim ngase s'kemi login
    public async Task<ActionResult<ScheduleResponseDto>> AddSchedule(
        [FromServices] IStaffScheduleService svc,
        Guid employeeId,
        [FromBody] CreateUpdateScheduleDto dto,
        CancellationToken ct = default)
    {
        try
        {
            var created = await svc.AddScheduleAsync(employeeId, dto, StaffAuditHelper.Actor(User), ct);
            return CreatedAtAction(nameof(GetScheduleById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("schedules/{id:guid}")]
    // [Authorize(Roles = "Admin")] // Komentuar për testim
    public async Task<ActionResult<ScheduleResponseDto>> UpdateSchedule(
        [FromServices] IStaffScheduleService svc,
        Guid id,
        [FromBody] CreateUpdateScheduleDto dto,
        CancellationToken ct = default)
    {
        try
        {
            var e = await svc.UpdateScheduleAsync(id, dto, StaffAuditHelper.Actor(User), ct);
            return e == null ? NotFound() : Ok(e);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("schedules/{id:guid}")]
    // [Authorize(Roles = "Admin")] // Komentuar për testim
    public async Task<IActionResult> DeleteSchedule(
        [FromServices] IStaffScheduleService svc,
        Guid id,
        CancellationToken ct = default)
    {
        var ok = await svc.DeleteScheduleAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}
