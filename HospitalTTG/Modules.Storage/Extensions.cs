using Contracts.Storage.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Modules.Storage.Configurations;
using Modules.Storage.Repositories;
using Modules.Storage.Services;
using Shared.Infrastructure.Data;

namespace Modules.Storage;

public static class Extensions
{
    public static IServiceCollection AddStorageModule(this IServiceCollection services, IConfiguration configuration)
    {
        AppDbContext.RegisterModuleAssembly(typeof(StoredFileConfiguration).Assembly);

        services.AddScoped<IStoredFileRepository, StoredFileRepository>();
        services.AddScoped<IStorageService, StorageService>();

        return services;
    }
}
