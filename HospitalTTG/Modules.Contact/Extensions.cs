using Contracts.Contact.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Modules.Contact.Configurations;
using Modules.Contact.Repositories;
using Modules.Contact.Services;
using Shared.Infrastructure.Data;

namespace Modules.Contact;

public static class Extensions
{
    public static IServiceCollection AddContactModule(this IServiceCollection services, IConfiguration configuration)
    {
        AppDbContext.RegisterModuleAssembly(typeof(ContactConfiguration).Assembly);
        
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<IContactService, ContactService>();

        return services;
    }
}
