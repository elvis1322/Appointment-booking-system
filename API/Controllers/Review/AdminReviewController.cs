using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Security;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/reviews")]
public class AdminReviewController : ControllerBase
{
    private readonly IReviewService _service;

    public AdminReviewController(IReviewService service)
    {
        _service = service;
    }

    [HttpGet]
    [HasPermission("Reviews:Read")]
    public async Task<IActionResult> GetAllReviews()
    {
        var reviews = await _service.GetAllReviewsAsync();
        return Ok(reviews);
    }
}