namespace Domain.Entities;

/// <summary>
/// Rreshti i lidhjes many-to-many: cili punonjës ofron cilin shërbim.
/// Çelësi primar zakonisht është kompozit (EmployeeId, ServiceId) – konfigurohet në EF, jo këtu.
/// </summary>
public class EmployeeServiceRelation : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
}
