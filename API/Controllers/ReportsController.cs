using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;
using System.Globalization;
using System.Text;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly DataContext _db;

    public ReportsController(DataContext db)
    {
        _db = db;
    }

    [HttpGet("appointments/json")]
    public async Task<IActionResult> ExportAppointmentsJson()
    {
        var data = await _db.Appointments
            .Include(a => a.User)
            .Include(a => a.Status)
            .Include(a => a.Service)
            .Include(a => a.Employee).ThenInclude(e => e!.User)
            .AsNoTracking()
            .Select(a => new
            {
                a.Id,
                Customer = a.User.FirstName + " " + a.User.LastName,
                CustomerEmail = a.User.Email,
                Service = a.Service != null ? a.Service.Name : "—",
                Employee = a.Employee != null ? a.Employee.User.FirstName + " " + a.Employee.User.LastName : "—",
                StartTime = a.StartTime.ToString("yyyy-MM-dd HH:mm"),
                EndTime = a.EndTime.ToString("yyyy-MM-dd HH:mm"),
                Status = a.Status.Name,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("appointments/csv")]
    public async Task<IActionResult> ExportAppointmentsCsv()
    {
        var data = await _db.Appointments
            .Include(a => a.User)
            .Include(a => a.Status)
            .Include(a => a.Service)
            .Include(a => a.Employee).ThenInclude(e => e!.User)
            .AsNoTracking()
            .ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("Id,Customer,CustomerEmail,Service,Employee,StartTime,EndTime,Status,CreatedAt");

        foreach (var a in data)
        {
            var customer = $"{a.User.FirstName} {a.User.LastName}";
            var service = a.Service?.Name ?? "—";
            var employee = a.Employee != null ? $"{a.Employee.User.FirstName} {a.Employee.User.LastName}" : "—";
            csv.AppendLine($"{a.Id},{Escape(customer)},{Escape(a.User.Email)},{Escape(service)},{Escape(employee)},{a.StartTime:yyyy-MM-dd HH:mm},{a.EndTime:yyyy-MM-dd HH:mm},{Escape(a.Status.Name)},{a.CreatedAt:yyyy-MM-dd}");
        }

        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "appointments.csv");
    }

    [HttpGet("appointments/excel")]
    public async Task<IActionResult> ExportAppointmentsExcel()
    {
        var data = await _db.Appointments
            .Include(a => a.User)
            .Include(a => a.Status)
            .Include(a => a.Service)
            .Include(a => a.Employee).ThenInclude(e => e!.User)
            .AsNoTracking()
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Appointments");

        // Header
        var headers = new[] { "Id", "Customer", "Email", "Service", "Employee", "Start Time", "End Time", "Status", "Created At" };
        for (int i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        // Style header
        var headerRange = ws.Range(1, 1, 1, headers.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4F81BD");
        headerRange.Style.Font.FontColor = XLColor.White;

        // Data
        int row = 2;
        foreach (var a in data)
        {
            var customer = $"{a.User.FirstName} {a.User.LastName}";
            var service = a.Service?.Name ?? "—";
            var employee = a.Employee != null ? $"{a.Employee.User.FirstName} {a.Employee.User.LastName}" : "—";

            ws.Cell(row, 1).Value = a.Id.ToString();
            ws.Cell(row, 2).Value = customer;
            ws.Cell(row, 3).Value = a.User.Email;
            ws.Cell(row, 4).Value = service;
            ws.Cell(row, 5).Value = employee;
            ws.Cell(row, 6).Value = a.StartTime.ToString("yyyy-MM-dd HH:mm");
            ws.Cell(row, 7).Value = a.EndTime.ToString("yyyy-MM-dd HH:mm");
            ws.Cell(row, 8).Value = a.Status.Name;
            ws.Cell(row, 9).Value = a.CreatedAt.ToString("yyyy-MM-dd");
            row++;
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "appointments.xlsx");
    }

    [HttpGet("payments/json")]
    public async Task<IActionResult> ExportPaymentsJson()
    {
        var data = await _db.Payments
            .AsNoTracking()
            .Select(p => new
            {
                p.Id,
                p.OrderId,
                p.Amount,
                p.PaymentMethod,
                p.StripePaymentIntentId,
                p.Status,
                p.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("payments/csv")]
    public async Task<IActionResult> ExportPaymentsCsv()
    {
        var data = await _db.Payments.AsNoTracking().ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("Id,OrderId,Amount,PaymentMethod,StripePaymentIntentId,Status,CreatedAt");

        foreach (var p in data)
            csv.AppendLine($"{p.Id},{p.OrderId},{p.Amount},{Escape(p.PaymentMethod)},{Escape(p.StripePaymentIntentId ?? "")},{Escape(p.Status)},{p.CreatedAt:yyyy-MM-dd}");

        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "payments.csv");
    }

    [HttpGet("payments/excel")]
    public async Task<IActionResult> ExportPaymentsExcel()
    {
        var data = await _db.Payments.AsNoTracking().ToListAsync();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Payments");

        var headers = new[] { "Id", "Order Id", "Amount (€)", "Payment Method", "Stripe Intent Id", "Status", "Created At" };
        for (int i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        var headerRange = ws.Range(1, 1, 1, headers.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#70AD47");
        headerRange.Style.Font.FontColor = XLColor.White;

        int row = 2;
        foreach (var p in data)
        {
            ws.Cell(row, 1).Value = p.Id.ToString();
            ws.Cell(row, 2).Value = p.OrderId.ToString();
            ws.Cell(row, 3).Value = (double)p.Amount;
            ws.Cell(row, 4).Value = p.PaymentMethod;
            ws.Cell(row, 5).Value = p.StripePaymentIntentId ?? "";
            ws.Cell(row, 6).Value = p.Status;
            ws.Cell(row, 7).Value = p.CreatedAt.ToString("yyyy-MM-dd");
            row++;
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "payments.xlsx");
    }

    [HttpGet("reviews/json")]
    public async Task<IActionResult> ExportReviewsJson()
    {
        var data = await _db.Reviews
            .Include(r => r.User)
            .AsNoTracking()
            .Select(r => new
            {
                r.Id,
                Customer = r.User != null ? r.User.FirstName + " " + r.User.LastName : "—",
                CustomerEmail = r.User != null ? r.User.Email : "—",
                r.ServiceId,
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("reviews/csv")]
    public async Task<IActionResult> ExportReviewsCsv()
    {
        var data = await _db.Reviews
            .Include(r => r.User)
            .AsNoTracking()
            .ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("Id,Customer,CustomerEmail,ServiceId,Rating,Comment,CreatedAt");

        foreach (var r in data)
        {
            var customer = r.User != null ? $"{r.User.FirstName} {r.User.LastName}" : "—";
            var email = r.User?.Email ?? "—";
            csv.AppendLine($"{r.Id},{Escape(customer)},{Escape(email)},{r.ServiceId},{r.Rating},{Escape(r.Comment)},{r.CreatedAt:yyyy-MM-dd}");
        }

        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "reviews.csv");
    }

    [HttpGet("reviews/excel")]
    public async Task<IActionResult> ExportReviewsExcel()
    {
        var data = await _db.Reviews
            .Include(r => r.User)
            .AsNoTracking()
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Reviews");

        var headers = new[] { "Id", "Customer", "Email", "Service Id", "Rating (1-5)", "Comment", "Created At" };
        for (int i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        var headerRange = ws.Range(1, 1, 1, headers.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#ED7D31");
        headerRange.Style.Font.FontColor = XLColor.White;

        int row = 2;
        foreach (var r in data)
        {
            var customer = r.User != null ? $"{r.User.FirstName} {r.User.LastName}" : "—";
            ws.Cell(row, 1).Value = r.Id.ToString();
            ws.Cell(row, 2).Value = customer;
            ws.Cell(row, 3).Value = r.User?.Email ?? "—";
            ws.Cell(row, 4).Value = r.ServiceId.ToString();
            ws.Cell(row, 5).Value = r.Rating;
            ws.Cell(row, 6).Value = r.Comment;
            ws.Cell(row, 7).Value = r.CreatedAt.ToString("yyyy-MM-dd");
            row++;
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "reviews.xlsx");
    }

    [HttpPost("reviews/import-csv")]
    public async Task<IActionResult> ImportReviewsCsv(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Nuk u ngarkua asnjë skedar.");

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Formati i skedarit duhet të jetë CSV.");

        var imported = new List<string>();
        var errors = new List<string>();

        using var reader = new StreamReader(file.OpenReadStream());
        var allLines = (await reader.ReadToEndAsync()).Split('\n');
        var header = allLines.FirstOrDefault(); // skip header line

        int lineNumber = 1;
        foreach (var rawLine in allLines.Skip(1))
        {
            lineNumber++;
            var line = rawLine.Trim('\r');
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols = line.Split(',');

            try
            {
                // Format: UserId, ServiceId, Rating, Comment
                if (cols.Length < 4)
                {
                    errors.Add($"Rreshti {lineNumber}: numër i pamjaftueshëm i kolonave (kërkohet: UserId, ServiceId, Rating, Comment).");
                    continue;
                }

                if (!Guid.TryParse(cols[0].Trim(), out var userId))
                {
                    errors.Add($"Rreshti {lineNumber}: UserId i pavlefshëm '{cols[0].Trim()}'.");
                    continue;
                }

                if (!Guid.TryParse(cols[1].Trim(), out var serviceId))
                {
                    errors.Add($"Rreshti {lineNumber}: ServiceId i pavlefshëm '{cols[1].Trim()}'.");
                    continue;
                }

                if (!int.TryParse(cols[2].Trim(), out var rating) || rating < 1 || rating > 5)
                {
                    errors.Add($"Rreshti {lineNumber}: Rating duhet të jetë numër nga 1 deri 5.");
                    continue;
                }

                var comment = cols.Length > 3 ? cols[3].Trim().Trim('"') : "";

                var review = new Domain.Entities.Review
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    ServiceId = serviceId,
                    Rating = rating,
                    Comment = comment,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = User.Identity?.Name ?? "import",
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = User.Identity?.Name ?? "import"
                };

                _db.Reviews.Add(review);
                imported.Add($"Rreshti {lineNumber}: u importua me sukses.");
            }
            catch (Exception ex)
            {
                errors.Add($"Rreshti {lineNumber}: gabim — {ex.Message}");
            }
        }

        if (imported.Any())
            await _db.SaveChangesAsync();

        return Ok(new
        {
            TotalImported = imported.Count,
            TotalErrors = errors.Count,
            Imported = imported,
            Errors = errors
        });
    }

    private static string Escape(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}