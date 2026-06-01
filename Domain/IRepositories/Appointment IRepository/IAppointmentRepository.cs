using Domain.Entities;

namespace Domain.Interfaces;
public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetAllAsync();
    Task<Appointment?> GetByIdAsync(Guid id);
    Task AddAsync(Appointment appointment);
    void Update(Appointment appointment);
    Task<bool> Delete(Guid id);
    Task<bool> SaveChangesAsync();
    Task<bool> IsSlotOccupiedAsync(DateTime start, DateTime end);
       Task<IEnumerable<Appointment>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Appointment>> GetByEmployeeUserIdAsync(Guid employeeUserId);
    Task<IEnumerable<Appointment>> GetBookedSlotsByDateAsync(DateTime date);
    Task<Appointment?> GetNotificationDetailsAsync(Guid appointmentId);
}