using Domain.Entities;
using Domain.Interfaces;
using Domain.Entities.Constants;
using Application.DTOs;
using Application.Interfaces;

namespace Application.Services;

public class AppointmentUserService : IAppointmentUserService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IServiceRepository _serviceRepository;

    public AppointmentUserService(
        IAppointmentRepository appointmentRepository,
        IServiceRepository serviceRepository)
    {
        _appointmentRepository = appointmentRepository;
        _serviceRepository = serviceRepository;
    }

    private static int CalculateBuffer(int durationMinutes) =>
        durationMinutes <= 30 ? 4 :
        durationMinutes <= 45 ? 8 : 10;

    public async Task<AppointmentUserDto> Create(Guid userId, CreateAppointmentUserDto dto)
    {
        var service = await _serviceRepository.GetByIdAsync(dto.ServiceId)
            ?? throw new Exception("Service not found.");

        var buffer = CalculateBuffer(service.DurationMinutes);
        var endTime = dto.StartTime.AddMinutes(service.DurationMinutes);
        var occupiedUntil = endTime.AddMinutes(buffer);

        var unavailabilityReason = await _appointmentRepository.CheckEmployeeAvailabilityAsync(
            dto.StartTime,
            dto.EmployeeId);

        if (unavailabilityReason == "DAY_OFF")
            throw new Exception("The selected employee is on a day off on this date. Please choose a different date or employee.");

        if (unavailabilityReason == "NOT_WORKING_DAY")
            throw new Exception("The selected employee does not work on this day. Please choose a different date or employee.");

        // Check if the user already has an appointment during this time
        var userOverlap = await _appointmentRepository.HasUserOverlapAsync(
            userId,
            dto.StartTime,
            endTime);

        if (userOverlap)
        {
            throw new Exception("You already have an appointment for this time");
        }

        var overlap = await _appointmentRepository.IsSlotOccupiedAsync(
            dto.StartTime,
            endTime,
            dto.EmployeeId);

        if (overlap)
        {
            var nextSlot = await _appointmentRepository.GetNextAvailableSlotAsync(
                dto.StartTime,
                service.DurationMinutes,
                buffer,
                dto.EmployeeId);

            var nextSlotMsg = nextSlot.HasValue
                ? nextSlot.Value.ToString("dd MMM yyyy HH:mm")
                : "No available slots today";

            throw new SlotOccupiedException(
                $"This time slot is occupied. The next available time is: {nextSlotMsg}",
                nextSlot);
        }

        var appointment = new Appointment
        {
            UserId = userId,
            StartTime = dto.StartTime,
            EndTime = endTime,
            OccupiedUntil = occupiedUntil,
            BufferTimeMinutes = buffer,
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

        var created = await _appointmentRepository.GetByIdAsync(appointment.Id);

        return MapUserDto(created!);
    }

    public async Task<IEnumerable<AppointmentUserDto>> GetMyAppointments(Guid userId)
    {
        var appointments = await _appointmentRepository.GetByUserIdAsync(userId);

        return appointments.Select(MapUserDto).ToList();
    }

    public async Task<IEnumerable<AppointmentUserDto>> GetEmployeeAppointments(Guid employeeUserId)
    {
        var appointments = await _appointmentRepository.GetByEmployeeUserIdAsync(employeeUserId);

        return appointments.Select(MapUserDto).ToList();
    }

    public async Task<AppointmentUserDto?> GetById(Guid id, Guid userId)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);

        if (appointment == null || appointment.UserId != userId)
            return null;

        return MapUserDto(appointment);
    }

    public async Task<bool> Cancel(Guid id, Guid userId)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);

        if (appointment == null || appointment.UserId != userId)
            return false;

        appointment.StatusId = AppDefaults.AppointmentStatus.Cancelled;
        appointment.UpdatedAt = DateTime.UtcNow;
        appointment.UpdatedBy = userId.ToString();

        await _appointmentRepository.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<BookedSlotDto>> GetBookedSlots(DateTime date)
    {
        var appointments = await _appointmentRepository.GetBookedSlotsByDateAsync(date);

        return appointments.Select(a => new BookedSlotDto
        {
            StartTime = a.StartTime,
            EndTime = a.OccupiedUntil
        });
    }

    public async Task<Appointment?> GetNotificationDetails(Guid appointmentId)
    {
        return await _appointmentRepository.GetNotificationDetailsAsync(appointmentId);
    }

    public async Task<AppointmentUserDto?> DelayAppointment(Guid id, Guid userId, DelayAppointmentDto dto)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);

        if (appointment == null || appointment.UserId != userId)
            return null;

        var newStart = appointment.StartTime.AddMinutes(dto.DelayMinutes);
        var duration = (int)(appointment.EndTime - appointment.StartTime).TotalMinutes;
        var newEnd = newStart.AddMinutes(duration);
        var newOccupiedUntil = newEnd.AddMinutes(appointment.BufferTimeMinutes);

        var overlap = await _appointmentRepository.IsSlotOccupiedAsync(
            newStart,
            newEnd,
            appointment.EmployeeId,
            excludeId: id);

        if (overlap)
            throw new Exception(
                $"Cannot delay: the new time slot ({newStart:HH:mm}-{newEnd:HH:mm}) conflicts with another appointment.");

        var userOverlap = await _appointmentRepository.HasUserOverlapAsync(
            userId,
            newStart,
            newEnd,
            excludeId: id);

        if (userOverlap)
            throw new Exception("You already have an appointment for this time");

        appointment.StartTime = newStart;
        appointment.EndTime = newEnd;
        appointment.OccupiedUntil = newOccupiedUntil;
        appointment.UpdatedAt = DateTime.UtcNow;
        appointment.UpdatedBy = userId.ToString();

        await _appointmentRepository.SaveChangesAsync();

        var updated = await _appointmentRepository.GetByIdAsync(id);

        return MapUserDto(updated!);
    }

    private static AppointmentUserDto MapUserDto(Appointment appointment) => new()
    {
        Id = appointment.Id,
        UserId = appointment.UserId,
        EmployeeUserId = appointment.Employee?.UserId,

        StartTime = appointment.StartTime,
        EndTime = appointment.EndTime,
        OccupiedUntil = appointment.OccupiedUntil,
        BufferTimeMinutes = appointment.BufferTimeMinutes,

        StatusName = appointment.Status?.Name ?? "Pending",
        ServiceName = appointment.Service?.Name ?? "General Service",

        EmployeeName = appointment.Employee?.User != null
            ? $"{appointment.Employee.User.FirstName} {appointment.Employee.User.LastName}"
            : "Unknown",

        UserName = appointment.User != null
            ? $"{appointment.User.FirstName} {appointment.User.LastName}"
            : "Unknown"
    };
}