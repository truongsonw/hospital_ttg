using Contracts.Doctor.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Modules.Doctor.Configurations;
using Modules.Doctor.Repositories;
using Modules.Doctor.Services;
using Shared.Infrastructure.Data;

namespace Modules.Doctor;

public static class Extensions
{
    public static IServiceCollection AddDoctorModule(this IServiceCollection services, IConfiguration configuration)
    {
        AppDbContext.RegisterModuleAssembly(typeof(DepartmentConfiguration).Assembly);

        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        services.AddScoped<IDoctorRepository, DoctorRepository>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IDoctorService, DoctorService>();

        return services;
    }
}
