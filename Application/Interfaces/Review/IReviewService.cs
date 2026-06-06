using Application.DTOs;

namespace Application.Interfaces;
public interface IReviewService
{
    Task<ReviewDto> CreateReviewAsync(CreateReviewDto dto, Guid userId);
    Task<List<ReviewDto>> GetReviewsForServiceAsync(Guid serviceId);
    Task<List<ReviewDto>> GetReviewsForEmployeeAsync(Guid employeeId);
    Task<List<ReviewDto>> GetReviewsForUserAsync(Guid userId);
    Task<List<ReviewDto>> GetAllReviewsAsync(); 
}