using System.Text;
using Contracts.Auth.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Modules.Auth.Configurations;
using Modules.Auth.Repositories;
using Modules.Auth.Services;
using Shared.Infrastructure.Data;

namespace Modules.Auth;

public static class Extensions
{
    public const string UserManagementPolicy = "UserManagement";
    public const string AdminRole = "Admin";

    public static IServiceCollection AddAuthModule(this IServiceCollection services, IConfiguration configuration)
    {
        AppDbContext.RegisterModuleAssembly(typeof(UserConfiguration).Assembly);
        AppDbContext.RegisterModuleAssembly(typeof(RoleConfiguration).Assembly);

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserManagementService, UserManagementService>();

        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRoleService, RoleService>();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!))
            };
        });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(UserManagementPolicy, policy =>
                policy.RequireAuthenticatedUser().RequireRole(AdminRole));
        });

        return services;
    }
}
