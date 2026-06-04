using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Application.DTOs;
using Persistence.Security;

namespace API.Controllers;

[ApiController]
[Route("api/admin/payments")]
[Authorize(Roles = "Admin")]
public class PaymentAdminController : ControllerBase
{
    private readonly IPaymentAdminService _service;

    public PaymentAdminController(IPaymentAdminService service)
    {
        _service = service;
    }

    [HttpGet]
    [HasPermission("Payments:Read")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpPut("{id}")]
    [HasPermission("Payments:Update")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdatePaymentStatusDto dto)
    {
        var result = await _service.UpdateStatusAsync(id, dto.Status);

        if (result == null)
            return NotFound(new { message = "Payment nuk u gjet" });

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [HasPermission("Payments:Delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _service.DeleteAsync(id);

        if (!result)
            return NotFound(new { message = "Payment nuk u gjet" });

        return Ok(new { message = "Payment u fshi me sukses" });
    }
}