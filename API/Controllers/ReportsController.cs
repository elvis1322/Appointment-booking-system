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

    // ─────────────────────────────────────────────────────────────
    //  APPOINTMENTS — Export JSON / CSV / Excel  +  Import CSV
    // ─────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────
    //  PAYMENTS — Export JSON / CSV / Excel  +  Import CSV
    // ─────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────
    //  REVIEWS — Export JSON / CSV / Excel  +  Import CSV
    // ─────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────
    //  IMPORT CSV — Reviews (Shembull importi)
    // ─────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────
    //  EMPLOYEES — Export JSON / CSV / Excel  +  Import CSV
    // ─────────────────────────────────────────────────────────────

    [HttpGet("employees/json")]
    public async Task<IActionResult> ExportEmployeesJson()
    {
        var data = await _db.Employees
            .Include(e => e.User)
            .AsNoTracking()
            .Select(e => new
            {
                e.Id,
                FirstName  = e.User.FirstName,
                LastName   = e.User.LastName,
                Email      = e.User.Email,
                e.JobTitle,
                e.Phone,
                e.IsActive,
                e.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("employees/csv")]
    public async Task<IActionResult> ExportEmployeesCsv()
    {
        var data = await _db.Employees
            .Include(e => e.User)
            .AsNoTracking()
            .ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("Id,FirstName,LastName,Email,JobTitle,Phone,IsActive,CreatedAt");

        foreach (var e in data)
            csv.AppendLine($"{e.Id},{Escape(e.User.FirstName)},{Escape(e.User.LastName)},{Escape(e.User.Email)},{Escape(e.JobTitle ?? "")},{Escape(e.Phone ?? "")},{e.IsActive},{e.CreatedAt:yyyy-MM-dd}");

        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "employees.csv");
    }

    [HttpGet("employees/excel")]
    public async Task<IActionResult> ExportEmployeesExcel()
    {
        var data = await _db.Employees
            .Include(e => e.User)
            .AsNoTracking()
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Employees");

        var headers = new[] { "Id", "First Name", "Last Name", "Email", "Job Title", "Phone", "Is Active", "Created At" };
        for (int i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        var headerRange = ws.Range(1, 1, 1, headers.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#9E5CC4");
        headerRange.Style.Font.FontColor = XLColor.White;

        int row = 2;
        foreach (var e in data)
        {
            ws.Cell(row, 1).Value = e.Id.ToString();
            ws.Cell(row, 2).Value = e.User.FirstName;
            ws.Cell(row, 3).Value = e.User.LastName;
            ws.Cell(row, 4).Value = e.User.Email;
            ws.Cell(row, 5).Value = e.JobTitle ?? "";
            ws.Cell(row, 6).Value = e.Phone ?? "";
            ws.Cell(row, 7).Value = e.IsActive ? "Yes" : "No";
            ws.Cell(row, 8).Value = e.CreatedAt.ToString("yyyy-MM-dd");
            row++;
        }

        ws.Columns().AdjustToContents();
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "employees.xlsx");
    }

    [HttpPost("employees/import-csv")]
    public async Task<IActionResult> ImportEmployeesCsv(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Nuk u ngarkua asnjë skedar.");

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Formati i skedarit duhet të jetë CSV.");

        var imported = new List<string>();
        var errors   = new List<string>();

        using var reader = new StreamReader(file.OpenReadStream());
        var allLines = (await reader.ReadToEndAsync()).Split('\n');

        int lineNumber = 1;
        foreach (var rawLine in allLines.Skip(1))
        {
            lineNumber++;
            var line = rawLine.Trim('\r');
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols = line.Split(',');
            try
            {
                // Format: FirstName, LastName, Email, JobTitle, Phone
                if (cols.Length < 3)
                {
                    errors.Add($"Rreshti {lineNumber}: kërkohet të paktën: FirstName, LastName, Email.");
                    continue;
                }

                var firstName = cols[0].Trim().Trim('"');
                var lastName  = cols[1].Trim().Trim('"');
                var email     = cols[2].Trim().Trim('"').ToLower();
                var jobTitle  = cols.Length > 3 ? cols[3].Trim().Trim('"') : null;
                var phone     = cols.Length > 4 ? cols[4].Trim().Trim('"') : null;

                if (string.IsNullOrEmpty(email))
                {
                    errors.Add($"Rreshti {lineNumber}: Email është i zbrazët.");
                    continue;
                }

                var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (existingUser != null)
                {
                    errors.Add($"Rreshti {lineNumber}: Email '{email}' ekziston tashmë.");
                    continue;
                }

                var newUser = new Domain.Entities.User
                {
                    Id           = Guid.NewGuid(),
                    FirstName    = firstName,
                    LastName     = lastName,
                    Email        = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employee123!"),
                    CreatedAt    = DateTime.UtcNow,
                    CreatedBy    = User.Identity?.Name ?? "import",
                    UpdatedAt    = DateTime.UtcNow,
                    UpdatedBy    = User.Identity?.Name ?? "import",
                    UserRoles    = new List<Domain.Entities.UserRole>
                    {
                        new Domain.Entities.UserRole
                        {
                            RoleId    = Domain.Entities.Constants.AppDefaults.Roles.EmployeeId,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "import",
                            UpdatedAt = DateTime.UtcNow,
                            UpdatedBy = "import"
                        }
                    }
                };

                _db.Users.Add(newUser);
                await _db.SaveChangesAsync();

                var employee = new Domain.Entities.Employee
                {
                    Id        = Guid.NewGuid(),
                    UserId    = newUser.Id,
                    JobTitle  = jobTitle,
                    Phone     = phone,
                    IsActive  = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = User.Identity?.Name ?? "import",
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = User.Identity?.Name ?? "import"
                };

                _db.Employees.Add(employee);
                imported.Add($"Rreshti {lineNumber}: punonjësi '{firstName} {lastName}' u importua me sukses.");
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
            TotalErrors   = errors.Count,
            Imported      = imported,
            Errors        = errors
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  SERVICES — Export JSON / CSV / Excel  +  Import CSV
    // ─────────────────────────────────────────────────────────────

    [HttpGet("services/json")]
    public async Task<IActionResult> ExportServicesJson()
    {
        var data = await _db.Services
            .Include(s => s.ServiceCategory)
            .AsNoTracking()
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                Category      = s.ServiceCategory.Name,
                s.DurationMinutes,
                s.Price,
                s.IsActive,
                s.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("services/csv")]
    public async Task<IActionResult> ExportServicesCsv()
    {
        var data = await _db.Services
            .Include(s => s.ServiceCategory)
            .AsNoTracking()
            .ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("Id,Name,Description,Category,DurationMinutes,Price,IsActive,CreatedAt");

        foreach (var s in data)
            csv.AppendLine($"{s.Id},{Escape(s.Name)},{Escape(s.Description ?? "")},{Escape(s.ServiceCategory?.Name ?? "")},{s.DurationMinutes},{s.Price.ToString(CultureInfo.InvariantCulture)},{s.IsActive},{s.CreatedAt:yyyy-MM-dd}");

        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "services.csv");
    }

    [HttpGet("services/excel")]
    public async Task<IActionResult> ExportServicesExcel()
    {
        var data = await _db.Services
            .Include(s => s.ServiceCategory)
            .AsNoTracking()
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Services");

        var headers = new[] { "Id", "Name", "Description", "Category", "Duration (min)", "Price (€)", "Is Active", "Created At" };
        for (int i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        var headerRange = ws.Range(1, 1, 1, headers.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#C0504D");
        headerRange.Style.Font.FontColor = XLColor.White;

        int row = 2;
        foreach (var s in data)
        {
            ws.Cell(row, 1).Value = s.Id.ToString();
            ws.Cell(row, 2).Value = s.Name;
            ws.Cell(row, 3).Value = s.Description ?? "";
            ws.Cell(row, 4).Value = s.ServiceCategory?.Name ?? "";
            ws.Cell(row, 5).Value = s.DurationMinutes;
            ws.Cell(row, 6).Value = (double)s.Price;
            ws.Cell(row, 7).Value = s.IsActive ? "Yes" : "No";
            ws.Cell(row, 8).Value = s.CreatedAt.ToString("yyyy-MM-dd");
            row++;
        }

        ws.Columns().AdjustToContents();
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "services.xlsx");
    }

    [HttpPost("services/import-csv")]
    public async Task<IActionResult> ImportServicesCsv(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Nuk u ngarkua asnjë skedar.");

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Formati i skedarit duhet të jetë CSV.");

        var imported = new List<string>();
        var errors   = new List<string>();

        using var reader = new StreamReader(file.OpenReadStream());
        var allLines = (await reader.ReadToEndAsync()).Split('\n');

        int lineNumber = 1;
        foreach (var rawLine in allLines.Skip(1))
        {
            lineNumber++;
            var line = rawLine.Trim('\r');
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols = line.Split(',');
            try
            {
                // Format: ServiceCategoryId, Name, Description, DurationMinutes, Price
                if (cols.Length < 4)
                {
                    errors.Add($"Rreshti {lineNumber}: kërkohet: ServiceCategoryId, Name, DurationMinutes, Price.");
                    continue;
                }

                if (!Guid.TryParse(cols[0].Trim(), out var categoryId))
                {
                    errors.Add($"Rreshti {lineNumber}: ServiceCategoryId i pavlefshëm '{cols[0].Trim()}'.");
                    continue;
                }

                var categoryExists = await _db.ServiceCategories.AnyAsync(c => c.Id == categoryId);
                if (!categoryExists)
                {
                    errors.Add($"Rreshti {lineNumber}: Kategoria me Id '{categoryId}' nuk u gjet.");
                    continue;
                }

                var name = cols[1].Trim().Trim('"');
                var description = cols.Length > 2 ? cols[2].Trim().Trim('"') : null;

                if (!int.TryParse(cols[3].Trim(), out var duration) || duration < 1)
                {
                    errors.Add($"Rreshti {lineNumber}: DurationMinutes duhet të jetë numër pozitiv.");
                    continue;
                }

                if (!decimal.TryParse(cols.Length > 4 ? cols[4].Trim() : "0", NumberStyles.Any, CultureInfo.InvariantCulture, out var price))
                {
                    errors.Add($"Rreshti {lineNumber}: Price i pavlefshëm.");
                    continue;
                }

                var service = new Domain.Entities.Service
                {
                    Id                = Guid.NewGuid(),
                    ServiceCategoryId = categoryId,
                    Name              = name,
                    Description       = description,
                    DurationMinutes   = duration,
                    Price             = price,
                    IsActive          = true,
                    CreatedAt         = DateTime.UtcNow,
                    CreatedBy         = User.Identity?.Name ?? "import",
                    UpdatedAt         = DateTime.UtcNow,
                    UpdatedBy         = User.Identity?.Name ?? "import"
                };

                _db.Services.Add(service);
                imported.Add($"Rreshti {lineNumber}: shërbimi '{name}' u importua me sukses.");
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
            TotalErrors   = errors.Count,
            Imported      = imported,
            Errors        = errors
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  HELPER
    // ─────────────────────────────────────────────────────────────

    private static string Escape(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}