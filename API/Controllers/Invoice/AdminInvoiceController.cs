using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Security;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/invoices")]
public class AdminInvoiceController : ControllerBase
{
    private readonly IInvoiceService _service;

    public AdminInvoiceController(IInvoiceService service)
    {
        _service = service;
    }
    
    // GET: api/admin/invoices
    [HttpGet("{id}")]
    [HasPermission("Invoices:Read")]
    public async Task<IActionResult> GetInvoice(Guid id)
    {
        var invoice = await _service.GetInvoiceByIdAsync(id);

        if (invoice == null)
            return NotFound(new { message = "Invoice nuk u gjet" });

        return Ok(invoice);
    }
    
    // GET: api/admin/invoices/order/{orderId}
    [HttpGet("order/{orderId}")]
    [HasPermission("Invoices:Read")]
    public async Task<IActionResult> GetInvoiceByOrder(Guid orderId)
    {
        var invoice = await _service.GetInvoiceByOrderIdAsync(orderId);

        if (invoice == null)
            return NotFound(new { message = "Invoice për këtë order nuk u gjet" });

        return Ok(invoice);
    }
}