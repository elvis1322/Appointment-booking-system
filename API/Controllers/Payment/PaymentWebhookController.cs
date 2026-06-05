using Microsoft.AspNetCore.Mvc;
using Stripe;
using Domain.Interfaces;
using Domain.Entities.Constants;

[ApiController]
[Route("api/payments")]
public class PaymentWebhookController : ControllerBase
{
    private readonly IPaymentRepository _repo;
    private readonly IOrderRepository _orderRepo;
    private readonly IAppointmentRepository _appointmentRepo;
    private readonly IConfiguration _config;

    public PaymentWebhookController(
        IPaymentRepository repo,
        IOrderRepository orderRepo,
        IAppointmentRepository appointmentRepo,
        IConfiguration config)
    {
        _repo = repo;
        _orderRepo = orderRepo;
        _appointmentRepo = appointmentRepo;
        _config = config;
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var endpointSecret = _config["Stripe:WebhookSecret"]; // Lexohet nga appsettings.json

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                endpointSecret
            );

            if (stripeEvent.Type == "payment_intent.succeeded")
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;

                if (paymentIntent != null)
                {
                    // Gjej Payment në DB sipas StripePaymentIntentId
                    var payments = await _repo.GetAllAsync();
                    var myPayment = payments.FirstOrDefault(p => p.StripePaymentIntentId == paymentIntent.Id);

                    if (myPayment != null)
                    {
                        // 1. Update Payment status
                        myPayment.Status = "Paid";
                        myPayment.UpdatedAt = DateTime.UtcNow;
                        _repo.Update(myPayment);
                        await _repo.SaveChangesAsync();

                        // 2. Update Order status to "Paid"
                        var order = await _orderRepo.GetByIdAsync(myPayment.OrderId);
                        if (order != null)
                        {
                            order.Status = "Paid";
                            await _orderRepo.SaveChangesAsync();

                            // 3. Update Appointment status to "Confirmed"
                            var appointment = await _appointmentRepo.GetByIdAsync(order.AppointmentId);
                            if (appointment != null)
                            {
                                appointment.StatusId = AppDefaults.AppointmentStatus.Confirmed;
                                _appointmentRepo.Update(appointment);
                                await _appointmentRepo.SaveChangesAsync();
                            }
                        }
                    }
                }
            }

            return Ok();
        }
        catch (StripeException e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
    {
        StripeConfiguration.ApiKey = _config["Stripe:SecretKey"]; // Ensure initialized
        var service = new PaymentIntentService();
        var paymentIntent = await service.GetAsync(request.PaymentIntentId);

        if (paymentIntent.Status == "succeeded")
        {
            var payments = await _repo.GetAllAsync();
            var myPayment = payments.FirstOrDefault(p => p.StripePaymentIntentId == paymentIntent.Id);

            if (myPayment != null && myPayment.Status != "Paid")
            {
                myPayment.Status = "Paid";
                myPayment.UpdatedAt = DateTime.UtcNow;
                _repo.Update(myPayment);
                await _repo.SaveChangesAsync();

                var order = await _orderRepo.GetByIdAsync(myPayment.OrderId);
                if (order != null)
                {
                    order.Status = "Paid";
                    await _orderRepo.SaveChangesAsync();

                    var appointment = await _appointmentRepo.GetByIdAsync(order.AppointmentId);
                    if (appointment != null)
                    {
                        appointment.StatusId = AppDefaults.AppointmentStatus.Confirmed;
                        _appointmentRepo.Update(appointment);
                        await _appointmentRepo.SaveChangesAsync();
                    }
                }
            }
            return Ok(new { success = true });
        }
        return BadRequest(new { success = false, message = "Payment not successful" });
    }
}

public class ConfirmPaymentRequest
{
    public string PaymentIntentId { get; set; } = string.Empty;
}
