using Stripe;
using Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Application.Services;

public class StripeService : IStripeService
    {
        private readonly string _stripeSecret;

        
        public StripeService(IConfiguration config)
        {
            _stripeSecret = config["Stripe:SecretKey"] 
                            ?? throw new ArgumentNullException("Stripe:SecretKey", "Stripe SecretKey nuk u gjet ne appsettings.json");

            StripeConfiguration.ApiKey = _stripeSecret;
        }

        public async Task<PaymentIntent> CreateIntent(decimal amount)
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(amount * 100),
                Currency = "eur",
                PaymentMethodTypes = new List<string> { "card" }
            };

            var service = new PaymentIntentService();
            return await service.CreateAsync(options);
        }
    }