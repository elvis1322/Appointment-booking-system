using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Application.Interfaces;
using Persistence.Security;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/orders")]
public class AdminOrderController : ControllerBase
{
    private readonly IOrderAdminService _orderAdminService;

    public AdminOrderController(IOrderAdminService orderAdminService)
    {
        _orderAdminService = orderAdminService;
    }

    [HttpGet]
    [HasPermission("Orders:Read")]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _orderAdminService.GetAllOrdersAsync();
        return Ok(orders);
    }

    [HttpPut("{id}/status")]
    [HasPermission("Orders:Update")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Status))
            return BadRequest(new { message = "Statusi nuk mund të jetë bosh" });

        var success = await _orderAdminService.UpdateStatusAsync(id, dto.Status);

        if (!success)
            return NotFound(new { message = "Order nuk u gjet" });

        return Ok(new { message = "Statusi u azhurnua me sukses" });
    }

    [HttpDelete("{id}")]
    [HasPermission("Orders:Delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _orderAdminService.DeleteAsync(id);

        if (!success)
            return NotFound(new { message = "Order nuk u gjet" });

        return Ok(new { message = "Order u fshi me sukses" });
    }
}