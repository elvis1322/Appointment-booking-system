using Application.DTOs;

namespace Application.Interfaces;

public interface IAppointmentAdminService
{
   
    Task<IEnumerable<AppointmentAdminDto>> GetAllAppointments();

    
    Task<AppointmentAdminDto?> GetById(Guid id);

    Task<AppointmentAdminDto> Create(CreateAppointmentDto dto);

   
    Task<AppointmentAdminDto?> Update(Guid id, UpdateAppointmentDto dto);

      Task<AppointmentAdminDto?> ChangeStatus(Guid id, ChangeAppointmentStatusDTO dto);

      Task<bool> DeleteAppointment(Guid id);
}