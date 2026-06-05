using Stripe;
namespace Application.Interfaces;

public interface IStripeService
{
    Task<PaymentIntent> CreateIntent(decimal amount);
}