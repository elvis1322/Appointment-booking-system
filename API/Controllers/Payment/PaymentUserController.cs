using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Persistence.Security;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentUserController : ControllerBase
{
    private readonly IPaymentUsersService _service;

    public PaymentUserController(IPaymentUsersService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePaymentDto dto)
    {
        var userId = GetUserId();

        var result = await _service.CreatePaymentAsync(dto, userId);
        return Ok(result);
    }

    [HttpGet("my/{id}")]
    public async Task<IActionResult> GetMyPayment(Guid id)
    {
        var result = await _service.GetMyPaymentAsync(id);

        if (result == null)
            return NotFound(new { message = "Payment nuk u gjet" });

        return Ok(result);
    }

    [HttpPost("create-intent")]
    public async Task<IActionResult> CreateIntent(CreatePaymentDto dto)
    {
        var userId = GetUserId();

        var paymentResponse = await _service.CreatePaymentAsync(dto, userId);

        return Ok(new
        {
            paymentResponse.Id,
            paymentResponse.OrderId,
            paymentResponse.Amount,
            paymentResponse.Status,
            paymentResponse.ClientSecret
        });
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("ID e përdoruesit nuk u gjet në token.");

        return Guid.Parse(userIdClaim);
    }
}