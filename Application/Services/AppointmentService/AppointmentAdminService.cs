using Domain.Entities;
using Domain.Interfaces;
using Domain.Entities.Constants;
using Application.DTOs;
using Application.Interfaces;
using System.Security.Claims;
using BCrypt.Net;
using System.ComponentModel.DataAnnotations;

namespace Application.Services;

public class AppointmentAdminService :IAppointmentAdminService
{
    private readonly IAppointmentRepository _appointmentRepository;
    public AppointmentAdminService( IAppointmentRepository repository)
    {
        _appointmentRepository = repository;
       
    }
   public async Task<IEnumerable<AppointmentAdminDto>> GetAllAppointments()
{
    var appointments = await _appointmentRepository.GetAllAsync();
    
    return appointments.Select(a => new AppointmentAdminDto 
    {
        Id = a.Id,
        StartTime = a.StartTime,
        EndTime = a.EndTime,
        StatusName = a.Status?.Name ?? "N/A",
         UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "Unknown",
        ServiceName = a.Service?.Name ?? "—",
        ServiceId = a.ServiceId,
        EmployeeName = a.Employee != null && a.Employee.User != null ? $"{a.Employee.User.FirstName} {a.Employee.User.LastName}" : "Unknown"
    });
}

    // GET BY ID
    public async Task<AppointmentAdminDto?> GetById(Guid id)
    {
    var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null) return null;

        return new AppointmentAdminDto
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            StatusName = appointment.Status?.Name ?? "I panjohur",
            UserName = appointment.User != null ? $"{appointment.User.FirstName} {appointment.User.LastName}" : "Unknown",
            ServiceName = appointment.Service?.Name ?? "—",
            ServiceId = appointment.ServiceId,
            EmployeeName = appointment.Employee != null && appointment.Employee.User != null ? $"{appointment.Employee.User.FirstName} {appointment.Employee.User.LastName}" : "Unknown"
        };
    }

    //  CREATE
   public async Task<AppointmentAdminDto> Create(CreateAppointmentDto dto)
{
  var overlap = await _appointmentRepository.IsSlotOccupiedAsync(dto.StartTime, dto.EndTime);

    if (overlap)
        throw new Exception("Ky orar është i zënë.");
  
    var appointment = new Appointment
{
    UserId = dto.UserId,
    StartTime = dto.StartTime,
    EndTime = dto.EndTime,
    StatusId = AppDefaults.AppointmentStatus.Pending,
    ServiceId = dto.ServiceId,
    CreatedAt = DateTime.UtcNow,
    CreatedBy = "Admin", 
    UpdatedAt = DateTime.UtcNow,
    UpdatedBy = "Admin"
};

    
    await _appointmentRepository.AddAsync(appointment);
    await _appointmentRepository.SaveChangesAsync();

    var createdAppointment = await _appointmentRepository.GetByIdAsync(appointment.Id);

    return new AppointmentAdminDto
    {
        Id = createdAppointment!.Id,
        UserId = createdAppointment.UserId,
        StartTime = createdAppointment.StartTime,
        EndTime = createdAppointment.EndTime,
        StatusName = createdAppointment.Status?.Name ?? "Pending",
        UserName = createdAppointment.User != null ? $"{createdAppointment.User.FirstName} {createdAppointment.User.LastName}" : "Unknown",
        ServiceName = createdAppointment.Service?.Name ?? "—",
        ServiceId = createdAppointment.ServiceId,
        EmployeeName = createdAppointment.Employee != null && createdAppointment.Employee.User != null ? $"{createdAppointment.Employee.User.FirstName} {createdAppointment.Employee.User.LastName}" : "Unknown"
    };
}
    public async Task<AppointmentAdminDto?> Update(Guid id, UpdateAppointmentDto dto)
   {
    var existingAppointment = await _appointmentRepository.GetByIdAsync(id);
    
    if (existingAppointment == null) return null; 

    existingAppointment.StartTime = dto.StartTime;
    existingAppointment.EndTime = dto.EndTime;
    existingAppointment.StatusId = dto.StatusId;
     existingAppointment.UpdatedAt = DateTime.UtcNow;
     existingAppointment.UpdatedBy = "admin";

     await _appointmentRepository.SaveChangesAsync();
        var updatedAppointment = await _appointmentRepository.GetByIdAsync(id);

     return new AppointmentAdminDto
    {
        Id = updatedAppointment!.Id,
        StartTime = updatedAppointment.StartTime,
        EndTime = updatedAppointment.EndTime,
        StatusName = updatedAppointment.Status?.Name ?? "Unknown",
         UserName = updatedAppointment.User != null ? $"{updatedAppointment.User.FirstName} {updatedAppointment.User.LastName}" : "Unknown",
        ServiceName = updatedAppointment.Service?.Name ?? "—",
        ServiceId = updatedAppointment.ServiceId,
        EmployeeName = updatedAppointment.Employee != null && updatedAppointment.Employee.User != null ? $"{updatedAppointment.Employee.User.FirstName} {updatedAppointment.Employee.User.LastName}" : "Unknown"
    };
}
public async Task<AppointmentAdminDto?> ChangeStatus(Guid id, ChangeAppointmentStatusDTO dto)
{
    
    var appointment = await _appointmentRepository.GetByIdAsync(id);
    
    if (appointment == null) return null; 

     appointment.StatusId = dto.StatusId;
        appointment.UpdatedAt = DateTime.UtcNow;
        appointment.UpdatedBy = "admin";
    
    await _appointmentRepository.SaveChangesAsync();

     var updatedAppointment = await _appointmentRepository.GetByIdAsync(id);

    return new AppointmentAdminDto
    {
        Id = updatedAppointment!.Id,
        UserId = updatedAppointment.UserId,
        StartTime = updatedAppointment.StartTime,
        EndTime = updatedAppointment.EndTime,
        StatusName = updatedAppointment.Status?.Name ?? "I panjohur",
        UserName = updatedAppointment.User != null ? $"{updatedAppointment.User.FirstName} {updatedAppointment.User.LastName}" : "Unknown",
        ServiceName = updatedAppointment.Service?.Name ?? "—",
        ServiceId = updatedAppointment.ServiceId,
        EmployeeName = updatedAppointment.Employee != null && updatedAppointment.Employee.User != null ? $"{updatedAppointment.Employee.User.FirstName} {updatedAppointment.Employee.User.LastName}" : "Unknown"
        };
}
  public async Task<bool> DeleteAppointment(Guid id)
{
    var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null) return false;

    return await _appointmentRepository.Delete(id);
}
   
}