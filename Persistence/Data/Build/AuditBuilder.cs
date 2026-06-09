using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Domain.Entities;

namespace Persistence.Data;

public static class AuditBuilder
{
   
    public static void ConfigureAudit(this ModelBuilder modelBuilder)
    {   
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

   
    public static List<AuditEntry> HandleBeforeSaveChanges(this DbContext context, IHttpContextAccessor httpContextAccessor)
    {
        context.ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntry>();

        var userIdClaim = httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Guid? userId = Guid.TryParse(userIdClaim, out var parsedId) ? parsedId : null;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditEntry(entry)
            {
                TableName = entry.Entity.GetType().Name,
                UserId = userId,
                AuditAction = entry.State.ToString()
            };
            auditEntries.Add(auditEntry);

            foreach (var property in entry.Properties)
            {
                string propertyName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                  auditEntry.NewValues[propertyName] = property.CurrentValue ?? "NULL";
                    continue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.NewValues[propertyName] = property.CurrentValue ?? "NULL";
                        break;
                    case EntityState.Deleted:
                        auditEntry.OldValues[propertyName] = property.OriginalValue ?? "NULL";
                        break;
                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            auditEntry.ChangedColumns.Add(propertyName);
                            auditEntry.OldValues[propertyName] = property.OriginalValue ?? "NULL";
                            auditEntry.NewValues[propertyName] = property.CurrentValue ?? "NULL";
                        }
                        break;
                }
            }
        }
        return auditEntries;
    }

    // Kjo metodë ruan loget pas përfundimit të Save
    public static async Task HandleAfterSaveChangesAsync(this DbContext context, List<AuditEntry> auditEntries)
    {
        if (auditEntries == null || auditEntries.Count == 0) return;

        foreach (var auditEntry in auditEntries)
        {
            foreach (var prop in auditEntry.Entry.Properties)
            {
                if (prop.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[prop.Metadata.Name] = prop.CurrentValue ?? "NULL";
                }
            }
            context.Set<AuditLog>().Add(auditEntry.ToAudit());
        }
        
        // Përdorim SaveChanges() direkt nga konteksti
        await context.SaveChangesAsync();
    }
}