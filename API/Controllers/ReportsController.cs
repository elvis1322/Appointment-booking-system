using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    [HttpGet("appointments/json")]
    public IActionResult ExportAppointmentsJson()
    {
        var data = new[]
        {
            new
            {
                Id = 1,
                Customer = "John Doe",
                Status = "Confirmed",
                Total = 120
            },
            new
            {
                Id = 2,
                Customer = "Jane Smith",
                Status = "Pending",
                Total = 80
            }
        };

        return Ok(data);
    }

    [HttpGet("appointments/csv")]
    public IActionResult ExportAppointmentsCsv()
    {
        var csv = new StringBuilder();

        csv.AppendLine("Id,Customer,Status,Total");
        csv.AppendLine("1,John Doe,Confirmed,120");
        csv.AppendLine("2,Jane Smith,Pending,80");

        return File(
            Encoding.UTF8.GetBytes(csv.ToString()),
            "text/csv",
            "appointments-report.csv"
        );
    }

    [HttpGet("appointments/excel")]
    public IActionResult ExportAppointmentsExcel()
    {
        using var workbook = new XLWorkbook();

        var worksheet = workbook.Worksheets.Add("Appointments");

        worksheet.Cell(1, 1).Value = "Id";
        worksheet.Cell(1, 2).Value = "Customer";
        worksheet.Cell(1, 3).Value = "Status";
        worksheet.Cell(1, 4).Value = "Total";

        worksheet.Cell(2, 1).Value = 1;
        worksheet.Cell(2, 2).Value = "John Doe";
        worksheet.Cell(2, 3).Value = "Confirmed";
        worksheet.Cell(2, 4).Value = 120;

        worksheet.Cell(3, 1).Value = 2;
        worksheet.Cell(3, 2).Value = "Jane Smith";
        worksheet.Cell(3, 3).Value = "Pending";
        worksheet.Cell(3, 4).Value = 80;

        var headerRange = worksheet.Range(1, 1, 1, 4);

        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();

        workbook.SaveAs(stream);

        return File(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "appointments-report.xlsx"
        );
    }
}