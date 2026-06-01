using API;
using Application.DTOs.Staff;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Staff;

[ApiController]
[Route("api/service-categories")]
public class ServiceCategoriesController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ServiceCategoryResponseDto>>> GetAll(
        [FromServices] IStaffCatalogService svc,
        [FromQuery] bool includeInactive = false,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Read"))
            return Forbid();
        return Ok(await svc.GetCategoriesAsync(includeInactive, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ServiceCategoryResponseDto>> GetById(
        [FromServices] IStaffCatalogService svc,
        Guid id,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Read"))
            return Forbid();
        var e = await svc.GetCategoryByIdAsync(id, ct);
        return e == null ? NotFound() : Ok(e);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ServiceCategoryResponseDto>> Create(
        [FromServices] IStaffCatalogService svc,
        [FromBody] CreateUpdateServiceCategoryDto dto,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Create"))
            return Forbid();
        try
        {
            var created = await svc.CreateCategoryAsync(dto, StaffAuditHelper.Actor(User), ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ServiceCategoryResponseDto>> Update(
        [FromServices] IStaffCatalogService svc,
        Guid id,
        [FromBody] CreateUpdateServiceCategoryDto dto,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Update"))
            return Forbid();
        try
        {
            var e = await svc.UpdateCategoryAsync(id, dto, StaffAuditHelper.Actor(User), ct);
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
        [FromServices] IStaffCatalogService svc,
        Guid id,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Services:Delete"))
            return Forbid();
        try
        {
            var ok = await svc.DeleteCategoryAsync(id, ct);
            return ok ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }
}
