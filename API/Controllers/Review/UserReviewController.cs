using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using API.Security;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/user/reviews")]
public class UserReviewController : ControllerBase
{
    private readonly IReviewService _service;

    public UserReviewController(IReviewService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        var review = await _service.CreateReviewAsync(dto, userId);
        return Ok(review);
    }

    [HttpGet("service/{serviceId}")]
    public async Task<IActionResult> GetReviewsForService(Guid serviceId)
    {
        var reviews = await _service.GetReviewsForServiceAsync(serviceId);
        return Ok(reviews);
    }

     [HttpGet("my-reviews")]
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var reviews = await _service.GetReviewsForUserAsync(userId);
        return Ok(reviews);
    }
}