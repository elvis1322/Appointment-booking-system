using API;
using Application.DTOs.Staff;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Staff;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ServiceResponseDto>>> GetAll(
        [FromServices] IStaffCatalogService svc,
        [FromQuery] Guid? categoryId,
        [FromQuery] bool includeInactive = false,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Read"))
            return Forbid();
        return Ok(await svc.GetServicesAsync(categoryId, includeInactive, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ServiceResponseDto>> GetById(
        [FromServices] IStaffCatalogService svc,
        Guid id,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Read"))
            return Forbid();
        var e = await svc.GetServiceByIdAsync(id, ct);
        return e == null ? NotFound() : Ok(e);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ServiceResponseDto>> Create(
        [FromServices] IStaffCatalogService svc,
        [FromBody] CreateUpdateServiceDto dto,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Create"))
            return Forbid();
        try
        {
            var created = await svc.CreateServiceAsync(dto, StaffAuditHelper.Actor(User), ct);
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
    public async Task<ActionResult<ServiceResponseDto>> Update(
        [FromServices] IStaffCatalogService svc,
        Guid id,
        [FromBody] CreateUpdateServiceDto dto,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Update"))
            return Forbid();
        try
        {
            var e = await svc.UpdateServiceAsync(id, dto, StaffAuditHelper.Actor(User), ct);
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
        [FromServices] IStaffCatalogService svc,
        Guid id,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Delete"))
            return Forbid();
        var ok = await svc.DeleteServiceAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}
