using Microsoft.EntityFrameworkCore.ChangeTracking;
using Newtonsoft.Json;
using Domain.Entities;
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Data;

public class AuditEntry
{
    public AuditEntry(EntityEntry entry)
    {
        Entry = entry;
    }

    public EntityEntry Entry { get; }
    public Guid? UserId { get; set; }
    public string TableName { get; set; }= string.Empty;
    

    public string AuditAction { get; set; } = string.Empty;
    
    public Dictionary<string, object> KeyValues { get; } = new();
    public Dictionary<string, object> OldValues { get; } = new();
    public Dictionary<string, object> NewValues { get; } = new();
    public List<string> ChangedColumns { get; } = new();

    public AuditLog ToAudit()
    {
        var audit = new AuditLog();
        audit.Id = Guid.NewGuid();
        audit.UserId = UserId;
        audit.Action = AuditAction; // Këtu ia kalojmë vlerën AuditLog-ut
        audit.TableName = TableName;
        audit.CreatedAt = DateTime.UtcNow;
        
        // Përdorim Newtonsoft.Json për të konvertuar Dictionary në String
        audit.PrimaryKey = JsonConvert.SerializeObject(KeyValues);
        audit.OldValues = OldValues.Count == 0 ? null : JsonConvert.SerializeObject(OldValues);
        audit.NewValues = NewValues.Count == 0 ? null : JsonConvert.SerializeObject(NewValues);
        audit.AffectedColumns = ChangedColumns.Count == 0 ? null : JsonConvert.SerializeObject(ChangedColumns);
        
        return audit;
    }
}