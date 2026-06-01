using API;
using Application.DTOs.Staff;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Staff;

[ApiController]
[Route("api/locations")]
public class LocationsController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<LocationResponseDto>>> GetAll(
        [FromServices] IStaffDirectoryService svc,
        [FromQuery] bool includeInactive = false,
        CancellationToken ct = default)
    {
        return Ok(await svc.GetLocationsAsync(includeInactive, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<LocationResponseDto>> GetById(
        [FromServices] IStaffDirectoryService svc,
        Guid id,
        CancellationToken ct = default)
    {
        var e = await svc.GetLocationByIdAsync(id, ct);
        return e == null ? NotFound() : Ok(e);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<LocationResponseDto>> Create(
        [FromServices] IStaffDirectoryService svc,
        [FromBody] CreateUpdateLocationDto dto,
        CancellationToken ct = default)
    {
        try
        {
            var created = await svc.CreateLocationAsync(dto, StaffAuditHelper.Actor(User), ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<LocationResponseDto>> Update(
        [FromServices] IStaffDirectoryService svc,
        Guid id,
        [FromBody] CreateUpdateLocationDto dto,
        CancellationToken ct = default)
    {
        try
        {
            var e = await svc.UpdateLocationAsync(id, dto, StaffAuditHelper.Actor(User), ct);
            return e == null ? NotFound() : Ok(e);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        [FromServices] IStaffDirectoryService svc,
        Guid id,
        CancellationToken ct = default)
    {
        var ok = await svc.DeleteLocationAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}
