using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _repo;

    public ReviewService(IReviewRepository repo)
    {
        _repo = repo;
    }

    public async Task<ReviewDto> CreateReviewAsync(CreateReviewDto dto, Guid userId)
    {
        var review = new Review
        {
            Id = Guid.NewGuid(),
            ServiceId = dto.AppointmentId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow,
            CreatedBy =userId.ToString(),
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = userId.ToString()

        };

        await _repo.AddAsync(review);
        await _repo.SaveChangesAsync();

        return MapToDto(review);
    }

    public async Task<List<ReviewDto>> GetReviewsForServiceAsync(Guid serviceId)
    {
        var reviews = await _repo.GetByServiceIdAsync(serviceId);
        return reviews.Select(MapToDto).ToList();
    }

    public async Task<List<ReviewDto>> GetReviewsForEmployeeAsync(Guid employeeId)
    {
        var reviews = await _repo.GetByEmployeeIdAsync(employeeId);
        return reviews.Select(MapToDto).ToList();
    }

    public async Task<List<ReviewDto>> GetAllReviewsAsync()
    {
        var reviews = await _repo.GetAllAsync();
        return reviews.Select(MapToDto).ToList();
    }

    public async Task<List<ReviewDto>> GetReviewsForUserAsync(Guid userId)
    {
        var reviews = await _repo.GetByUserIdAsync(userId);
        return reviews.Select(MapToDto).ToList();
    }

    private ReviewDto MapToDto(Review review) => new ReviewDto
    {
        Id = review.Id,
        ServiceId = review.ServiceId,
        UserId = review.UserId,
        Rating = review.Rating,
        Comment = review.Comment,
        UserName = review.User != null ? $"{review.User.FirstName} {review.User.LastName}" : "Unknown",
        ServiceName = review.ServiceName,
        EmployeeName = review.EmployeeName
    };
}