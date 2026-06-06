using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Persistence.Security;
using System.Security.Claims;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/orders")]
public class OrderUserController : ControllerBase
{
    private readonly IOrderUserService _orderService;

    public OrderUserController(IOrderUserService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        var userId = GetUserId();

        try
        {
            var result = await _orderService.CreateAsync(dto, userId);

            return Ok(new
            {
                message = "Order u krijua me sukses",
                data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();
        var result = await _orderService.GetMyOrdersAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        var result = await _orderService.GetByIdAsync(id, userId);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var userId = GetUserId();

        var result = await _orderService.CancelAsync(id, userId);

        if (!result)
            return NotFound();

        return Ok(new { message = "Order u anulua me sukses" });
    }

    //  Helper për userId nga token
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("ID e përdoruesit nuk u gjet në token.");

        return Guid.Parse(userIdClaim);
    }
}

