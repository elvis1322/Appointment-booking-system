using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Security;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/user/invoices")]
    public class UserInvoiceController : ControllerBase
    {
        private readonly IInvoiceService _service;

        public UserInvoiceController(IInvoiceService service)
        {
            _service = service;
        }

        // Merr invoice për order specifik
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetInvoiceByOrder(Guid orderId)
        {
            var invoice = await _service.GetInvoiceByOrderIdAsync(orderId);

            if (invoice == null)
                return NotFound(new { message = "Invoice nuk u gjet" });

            return Ok(invoice);
        }

        // Merr PDF të invoice
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GetInvoicePdf(Guid id)
        {
            var pdfBytes = await _service.GenerateInvoicePdfAsync(id);

            return File(pdfBytes, "application/pdf", $"Invoice-{id}.pdf");
        }

        // Merr një invoice specifik
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoice(Guid id)
        {
            var invoice = await _service.GetInvoiceByIdAsync(id);

            if (invoice == null)
                return NotFound(new { message = "Invoice nuk u gjet" });

            return Ok(invoice);
        }
    }
}