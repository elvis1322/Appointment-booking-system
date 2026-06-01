using API;
using Application.DTOs.Staff;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Staff;

[ApiController]
[Route("api/rooms")]
public class RoomsController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<RoomResponseDto>>> GetAll(
        [FromServices] IStaffDirectoryService svc,
        [FromQuery] Guid? locationId,
        [FromQuery] bool includeInactive = false,
        CancellationToken ct = default)
    {
        return Ok(await svc.GetRoomsAsync(locationId, includeInactive, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<RoomResponseDto>> GetById(
        [FromServices] IStaffDirectoryService svc,
        Guid id,
        CancellationToken ct = default)
    {
        var e = await svc.GetRoomByIdAsync(id, ct);
        return e == null ? NotFound() : Ok(e);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoomResponseDto>> Create(
        [FromServices] IStaffDirectoryService svc,
        [FromBody] CreateUpdateRoomDto dto,
        CancellationToken ct = default)
    {
        try
        {
            var created = await svc.CreateRoomAsync(dto, StaffAuditHelper.Actor(User), ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoomResponseDto>> Update(
        [FromServices] IStaffDirectoryService svc,
        Guid id,
        [FromBody] CreateUpdateRoomDto dto,
        CancellationToken ct = default)
    {
        try
        {
            var e = await svc.UpdateRoomAsync(id, dto, StaffAuditHelper.Actor(User), ct);
            return e == null ? NotFound() : Ok(e);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
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
        var ok = await svc.DeleteRoomAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}
