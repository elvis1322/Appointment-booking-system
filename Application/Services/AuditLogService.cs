using Application.DTOs;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;

namespace Application.Services;

public class AuditLogService
{
    private readonly DataContext _context;

    public AuditLogService(DataContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLogDto>> GetRecentLogsAsync()
    {
         return await _context.AuditLogs
        .Include(a => a.User)
        .OrderByDescending(a => a.CreatedAt)
        .Take(100)
        .Select(a => new AuditLogDto
        {
            Id = a.Id,
            UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System/Anonymous",
            Action = a.Action,
            TableName = a.TableName,
            DateTime = a.CreatedAt,
            KeyValues = a.PrimaryKey, // SHTO KËTË RRESHT - Lidhja me DB
            OldValues = a.OldValues,
            NewValues = a.NewValues,
            AffectedColumns = a.AffectedColumns
        })
        .ToListAsync();
    }
}