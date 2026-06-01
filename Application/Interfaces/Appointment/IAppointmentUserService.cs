using Application.DTOs;

namespace Application.Interfaces;

public interface IAppointmentUserService
{
    Task<IEnumerable<AppointmentUserDto>> GetMyAppointments(Guid userId);
    Task<IEnumerable<AppointmentUserDto>> GetEmployeeAppointments(Guid employeeUserId);
    Task<AppointmentUserDto?> GetById(Guid id, Guid userId);
    Task<AppointmentUserDto> Create(Guid userId, CreateAppointmentUserDto dto); 
    Task<bool> Cancel(Guid id, Guid userId);
    Task<IEnumerable<BookedSlotDto>> GetBookedSlots(DateTime date);
    Task<Domain.Entities.Appointment?> GetNotificationDetails(Guid appointmentId);
}