using Contracts.Mail.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Modules.Mail.Options;
using Modules.Mail.Services;

namespace Modules.Mail;

public static class Extensions
{
    public static IServiceCollection AddMailModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MailOptions>(configuration.GetSection("Mail"));
        services.AddScoped<IMailSender, SmtpMailSender>();

        return services;
    }
}
