using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using API.Security;

namespace API.Controllers;

[ApiController]
[Route("api/admin/orderitems")]
[Authorize(Roles = "Admin")]
public class OrderItemAdminController : ControllerBase
{
    private readonly IOrderItemService _service;

    public OrderItemAdminController(IOrderItemService service)
    {
        _service = service;
    }

    // GET ALL ORDER ITEMS
    [HttpGet]
    [HasPermission("OrderItems:Read")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();

        return Ok(new
        {
            count = result.Count,
            items = result
        });
    }

    // GET BY ID
    [HttpGet("id/{id}")]
    [HasPermission("OrderItems:Read")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);

        if (result == null)
            return NotFound(new { message = "OrderItem nuk u gjet" });

        return Ok(result);
    }

    // GET BY ORDER ID
    [HttpGet("{orderId}")]
    [HasPermission("OrderItems:Read")]
    public async Task<IActionResult> GetByOrderId(Guid orderId)
    {
        var result = await _service.GetByOrderIdAsync(orderId);

        return Ok(new
        {
            orderId,
            count = result.Count,
            items = result
        });
    }
}