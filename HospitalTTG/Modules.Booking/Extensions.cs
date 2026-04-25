using Contracts.Booking.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Modules.Booking.Configurations;
using Modules.Booking.Repositories;
using Modules.Booking.Services;
using Shared.Infrastructure.Data;

namespace Modules.Booking;

public static class Extensions
{
    public static IServiceCollection AddBookingModule(this IServiceCollection services, IConfiguration configuration)
    {
        AppDbContext.RegisterModuleAssembly(typeof(BookingConfiguration).Assembly);
        
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IBookingService, BookingService>();

        return services;
    }
}
