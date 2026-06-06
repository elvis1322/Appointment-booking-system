using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderItemRepository _orderItemRepository;

        public InvoiceService(
            IInvoiceRepository invoiceRepository, 
            IOrderRepository orderRepository,
            IOrderItemRepository orderItemRepository)
        {
            _invoiceRepository = invoiceRepository ?? throw new ArgumentNullException(nameof(invoiceRepository));
            _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
            _orderItemRepository = orderItemRepository ?? throw new ArgumentNullException(nameof(orderItemRepository));
        }

        public async Task<InvoiceResponseDto> CreateInvoiceAsync(Guid orderId, Guid paymentId, decimal amount)
        {
            var invoice = new Invoice
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                PaymentId = paymentId,
                Amount = amount,
                Status = "Paid", 
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _invoiceRepository.AddAsync(invoice);
            await _invoiceRepository.SaveChangesAsync();

            return MapToDto(invoice);
        }

        
        public async Task<InvoiceResponseDto?> GetInvoiceByIdAsync(Guid id)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null) return null;

            return MapToDto(invoice);
        }

        
        public async Task<InvoiceResponseDto?> GetInvoiceByOrderIdAsync(Guid orderId)
        {
            var invoice = await _invoiceRepository.GetByOrderIdAsync(orderId);
            if (invoice == null) return null;

            return MapToDto(invoice);
        }

        
        public async Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null)
                throw new Exception("Invoice nuk u gjet");

            var order = await _orderRepository.GetByIdAsync(invoice.OrderId);
            if (order == null)
                throw new Exception("Order nuk u gjet");

            var items = await _orderItemRepository.GetByOrderIdAsync(invoice.OrderId);
            var userName = order.User != null ? $"{order.User.FirstName} {order.User.LastName}" : "Client";

            var pdfBytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily(Fonts.Arial));

                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(column =>
                        {
                            column.Item().Text("PAYMENT INVOICE").Bold().FontSize(24).FontColor(Colors.Blue.Darken2);
                            column.Item().Text($"Invoice #{invoice.Id.ToString().Substring(0, 8).ToUpper()}").FontSize(12).FontColor(Colors.Grey.Medium);
                        });
                        row.RelativeItem().AlignRight().Column(column =>
                        {
                            column.Item().Text("Appointment Booking System").Bold().FontSize(16);
                            column.Item().Text("Business Name / Address").FontColor(Colors.Grey.Darken1);
                        });
                    });

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Spacing(20);

                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text("Billed To:").Bold().FontColor(Colors.Grey.Darken2);
                                    c.Item().Text(userName).FontSize(14).Bold();
                                    c.Item().Text($"Email: {order.User?.Email ?? "N/A"}").FontColor(Colors.Grey.Medium);
                                });

                                row.RelativeItem().AlignRight().Column(c =>
                                {
                                    c.Item().Text($"Date: {invoice.CreatedAt:dd MMM yyyy}");
                                    c.Item().Text($"Order ID: {invoice.OrderId.ToString().Substring(0, 8).ToUpper()}");
                                    c.Item().Text($"Payment ID: {invoice.PaymentId.ToString().Substring(0, 8).ToUpper()}");
                                    c.Item().Text($"Status: {invoice.Status.ToUpper()}").Bold().FontColor(Colors.Green.Medium);
                                });
                            });

                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(3);
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten1).PaddingBottom(5).Text("Service Description").Bold();
                                    header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten1).PaddingBottom(5).AlignRight().Text("Amount").Bold();
                                });

                                var serviceName = order.Appointment?.Service?.Name ?? "Services associated with appointment";

                                foreach(var item in items)
                                {
                                    var description = string.IsNullOrWhiteSpace(item.Description) || item.Description == "Services associated with appointment" 
                                        ? serviceName 
                                        : item.Description;

                                    table.Cell().PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Text(description);
                                    table.Cell().PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3).AlignRight().Text($"{item.Price:0.00} EUR");
                                }
                                
                                if (!items.Any()) 
                                {
                                    table.Cell().PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Text(serviceName);
                                    table.Cell().PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3).AlignRight().Text($"{invoice.Amount:0.00} EUR");
                                }
                            });

                            column.Item().AlignRight().Text($"Total Paid: {invoice.Amount:0.00} EUR").Bold().FontSize(16).FontColor(Colors.Blue.Darken2);
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Thank you for your business! | Page ");
                            x.CurrentPageNumber();
                            x.Span(" of ");
                            x.TotalPages();
                        });
                });
            }).GeneratePdf();

            return pdfBytes;
        }

        
        private InvoiceResponseDto MapToDto(Invoice invoice)
        {
            return new InvoiceResponseDto
            {
                Id = invoice.Id,
                OrderId = invoice.OrderId,
                PaymentId = invoice.PaymentId,
                Amount = invoice.Amount,
                Status = invoice.Status
            };
        }
    }
}