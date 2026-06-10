using API;
using Application.DTOs;
using Application.DTOs.Staff;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Staff;

[ApiController]
[Route("api/employees")]
public class EmployeesController : ControllerBase
{
    private readonly IUADServices _uadServices;

    public EmployeesController(IUADServices uadServices)
    {
        _uadServices = uadServices;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<EmployeeResponseDto>>> GetAll(
        [FromServices] IStaffDirectoryService svc,
        [FromQuery] bool includeInactive = false,
        CancellationToken ct = default)
    {
        
        /// if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Staff:Read"))
          //   return Forbid();
        return Ok(await svc.GetEmployeesAsync(includeInactive, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<EmployeeResponseDto>> GetById(
        [FromServices] IStaffDirectoryService svc,
        Guid id,
        CancellationToken ct = default)
    {
        
        /// if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Staff:Read"))
          //   return Forbid();
        var e = await svc.GetEmployeeByIdAsync(id, ct);
        return e == null ? NotFound() : Ok(e);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EmployeeResponseDto>> Create(
        [FromServices] IStaffDirectoryService svc,
        [FromBody] CreateEmployeeRequestDto dto,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Staff:Create"))
            return Forbid();

        if (string.IsNullOrWhiteSpace(dto.FirstName) ||
            string.IsNullOrWhiteSpace(dto.LastName) ||
            string.IsNullOrWhiteSpace(dto.Email))
        {
            return BadRequest("Emri, mbiemri dhe email-i janë të detyrueshëm.");
        }

        try
        {
            var createdUser = await _uadServices.AddEmployee(new UserAdminDTO
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = dto.Email.Trim(),
                Gjinia = string.IsNullOrWhiteSpace(dto.Gjinia) ? string.Empty : dto.Gjinia.Trim(),
                RoleId = Guid.Empty,
                RoleName = "Employee"
            });

            var employee = await svc.CreateEmployeeAsync(new CreateEmployeeDto
            {
                UserId = createdUser.Id,
                JobTitle = string.IsNullOrWhiteSpace(dto.JobTitle) ? null : dto.JobTitle.Trim(),
                Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
            }, StaffAuditHelper.Actor(User), ct);

            return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EmployeeResponseDto>> Update(
        [FromServices] IStaffDirectoryService svc,
        Guid id,
        [FromBody] UpdateEmployeeDto dto,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Staff:Update"))
            return Forbid();
        var e = await svc.UpdateEmployeeAsync(id, dto, StaffAuditHelper.Actor(User), ct);
        return e == null ? NotFound() : Ok(e);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        [FromServices] IStaffDirectoryService svc,
        Guid id,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && c.Value == "Staff:Delete"))
            return Forbid();
        var ok = await svc.DeleteEmployeeAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpPut("{id:guid}/services")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignServices(
        [FromServices] IStaffDirectoryService svc,
        Guid id,
        [FromBody] AssignEmployeeServicesDto dto,
        CancellationToken ct = default)
    {
        if (!User.Claims.Any(c => c.Type == "permission" && (c.Value == "Staff:Update" || c.Value == "Services:Update")))
            return Forbid();
        try
        {
            await svc.AssignServicesAsync(id, dto, StaffAuditHelper.Actor(User), ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Gabim i brendshëm: {ex.Message} | {ex.InnerException?.Message}");
        }
    }
}
