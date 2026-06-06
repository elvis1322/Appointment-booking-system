using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

[ApiController]
[Route("api/orderitems")]
[Authorize]
public class OrderItemUserController : ControllerBase
{
    private readonly IOrderItemService _service;

    public OrderItemUserController(IOrderItemService service)
    {
        _service = service;
    }

    // CREATE 
    [HttpPost]
public async Task<IActionResult> Create(CreateOrderItemDto dto)
{
    var userId = GetUserId();

    var result = await _service.CreateAsync(dto, userId);

    
    return Ok(result);
}

    // GET BY ORDER
    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetByOrderId(Guid orderId)
    {
        var result = await _service.GetByOrderIdAsync(orderId);
        return Ok(result);
    }

    // helper për userId nga token
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID nuk u gjet në token.");

        return Guid.Parse(userIdClaim);
    }
}