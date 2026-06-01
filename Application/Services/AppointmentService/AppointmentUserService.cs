using Domain.Entities;
using Domain.Interfaces;
using Domain.Entities.Constants;
using Application.DTOs;
using Application.Interfaces;
using System.Security.Claims;
using BCrypt.Net;

namespace Application.Services;
public class AppointmentUserService : IAppointmentUserService
{
    
    private readonly IAppointmentRepository _appointmentRepository;

    public AppointmentUserService(IAppointmentRepository appointmentRepository)
    {
        _appointmentRepository = appointmentRepository;
    }
    public async Task<AppointmentUserDto> Create(Guid userId, CreateAppointmentUserDto dto)
{
    // Kontrollo overlap
    var overlap = await _appointmentRepository
        .IsSlotOccupiedAsync(dto.StartTime, dto.EndTime);

    if (overlap)
        throw new Exception("Ky orar është i zënë.");

    var appointment = new Appointment
    {
        UserId = userId, 
        StartTime = dto.StartTime,
        EndTime = dto.EndTime,
        StatusId = AppDefaults.AppointmentStatus.Pending,
        ServiceId = dto.ServiceId,
        EmployeeId = dto.EmployeeId,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,

        CreatedBy = userId.ToString(),
        UpdatedBy = userId.ToString()
    };

    await _appointmentRepository.AddAsync(appointment);
    await _appointmentRepository.SaveChangesAsync();

    var createdAppointment = await _appointmentRepository.GetByIdAsync(appointment.Id);

    return new AppointmentUserDto
    {
        Id = createdAppointment!.Id,
        StartTime = createdAppointment.StartTime,
        EndTime = createdAppointment.EndTime,
        StatusName = createdAppointment.Status?.Name ?? "Pending",
        ServiceName = createdAppointment.Service?.Name ?? "General Service",
        EmployeeName = createdAppointment.Employee != null && createdAppointment.Employee.User != null ? $"{createdAppointment.Employee.User.FirstName} {createdAppointment.Employee.User.LastName}" : "Unknown",
        UserName = createdAppointment.User != null ? $"{createdAppointment.User.FirstName} {createdAppointment.User.LastName}" : "Unknown"
    };
}

    // get appointments
  public async Task<IEnumerable<AppointmentUserDto>> GetMyAppointments(Guid userId)
{
    
    var appointments = await _appointmentRepository.GetByUserIdAsync(userId);

    return appointments.Select(a => new AppointmentUserDto
    {
        Id = a.Id,
        StartTime = a.StartTime,
        EndTime = a.EndTime,
        StatusName = a.Status?.Name ?? "Pending",
        ServiceName = a.Service?.Name ?? "General Service",
        EmployeeName = a.Employee != null && a.Employee.User != null ? $"{a.Employee.User.FirstName} {a.Employee.User.LastName}" : "Unknown",
        UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "Unknown"
    }).ToList();
}

    public async Task<IEnumerable<AppointmentUserDto>> GetEmployeeAppointments(Guid employeeUserId)
    {
        var appointments = await _appointmentRepository.GetByEmployeeUserIdAsync(employeeUserId);

        return appointments.Select(a => new AppointmentUserDto
        {
            Id = a.Id,
            StartTime = a.StartTime,
            EndTime = a.EndTime,
            StatusName = a.Status?.Name ?? "Pending",
            ServiceName = a.Service?.Name ?? "General Service",
            EmployeeName = a.Employee != null && a.Employee.User != null ? $"{a.Employee.User.FirstName} {a.Employee.User.LastName}" : "Unknown",
            UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "Unknown"
        }).ToList();
    }
   
    public async Task<AppointmentUserDto?> GetById(Guid id, Guid userId)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);

        
        if (appointment == null || appointment.UserId != userId) 
            return null;

        return new AppointmentUserDto
        {
            Id = appointment.Id,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            StatusName = appointment.Status?.Name ?? "N/A",
            ServiceName = appointment.Service?.Name ?? "General Service",
            EmployeeName = appointment.Employee != null && appointment.Employee.User != null ? $"{appointment.Employee.User.FirstName} {appointment.Employee.User.LastName}" : "Unknown",
            UserName = appointment.User != null ? $"{appointment.User.FirstName} {appointment.User.LastName}" : "Unknown"
        };
    }

    
    public async Task<bool> Cancel(Guid id, Guid userId)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);

        if (appointment == null || appointment.UserId != userId)
            return false;

       
        appointment.StatusId = AppDefaults.AppointmentStatus.Cancelled;

        await _appointmentRepository.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<BookedSlotDto>> GetBookedSlots(DateTime date)
    {
        var appointments = await _appointmentRepository.GetBookedSlotsByDateAsync(date);

        return appointments.Select(a => new BookedSlotDto
        {
            StartTime = a.StartTime,
            EndTime = a.EndTime
        });
    }
    public async Task<Appointment?> GetNotificationDetails(Guid appointmentId)
    {
        return await _appointmentRepository.GetNotificationDetailsAsync(appointmentId);
    }
}