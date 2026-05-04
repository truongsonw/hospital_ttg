using Contracts.System.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Modules.System.Configurations;
using Modules.System.Repositories;
using Modules.System.Services;
using Shared.Infrastructure.Data;

namespace Modules.System;

public static class Extensions
{
    public static IServiceCollection AddSystemModule(this IServiceCollection services, IConfiguration configuration)
    {
        AppDbContext.RegisterModuleAssembly(typeof(MenuConfiguration).Assembly);

        // Menu
        services.AddScoped<IMenuRepository, MenuRepository>();
        services.AddScoped<IRoleMenuRepository, RoleMenuRepository>();
        services.AddScoped<ISysMenuService, SysMenuService>();

        // Category
        services.AddScoped<ISysCategoryRepository, SysCategoryRepository>();
        services.AddScoped<ISysCategoryService, SysCategoryService>();

        // Site Settings
        services.AddScoped<ISiteSettingRepository, SiteSettingRepository>();
        services.AddScoped<ISiteSettingService, SiteSettingService>();
        services.AddScoped<IHomePageService, HomePageService>();

        // Dashboard stats
        services.AddScoped<IDashboardStatsService, DashboardStatsService>();

        return services;
    }
}
