using System.Text;
using System.Security.Claims;
using Contracts.Auth.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Modules.Auth.Authorization;
using Modules.Auth.Configurations;
using Modules.Auth.Repositories;
using Modules.Auth.Services;
using Shared.Infrastructure.Data;

namespace Modules.Auth;

public static class Extensions
{
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

        // Authorization handlers
        services.AddScoped<IAuthorizationHandler, MenuAccessHandler>();
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

        services.AddAuthorization(options =>
        {
            // ── Permission-based policies ───────────────────────────────
            // dashboard.view covers dashboard index and summary stats
            options.AddPolicy(Permissions.DashboardView, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.DashboardView)));

            // user.manage covers user CRUD + status + password reset
            options.AddPolicy(Permissions.UserManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.UserManage)));

            // role.manage covers role listing and detail
            options.AddPolicy(Permissions.RoleManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.RoleManage)));

            // menu.manage covers menu CRUD + role-menu assignment
            options.AddPolicy(Permissions.MenuManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.MenuManage)));

            // category.manage covers system category CRUD
            options.AddPolicy(Permissions.CategoryManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.CategoryManage)));

            // article_content.manage covers content CRUD
            options.AddPolicy(Permissions.ArticleContentManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.ArticleContentManage)));

            // article_media.manage covers content media upload/remove
            options.AddPolicy(Permissions.ArticleMediaManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.ArticleMediaManage)));

            // booking.manage covers booking admin listing and state changes
            options.AddPolicy(Permissions.BookingManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.BookingManage)));

            // contact.manage covers contact admin listing, reply, and status changes
            options.AddPolicy(Permissions.ContactManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.ContactManage)));

            // doctor.manage covers doctor admin CRUD and management lists
            options.AddPolicy(Permissions.DoctorManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.DoctorManage)));

            // department.manage covers department admin CRUD and listing
            options.AddPolicy(Permissions.DepartmentManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.DepartmentManage)));

            // site_settings.manage covers admin site settings read/write
            options.AddPolicy(Permissions.SiteSettingsManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.SiteSettingsManage)));

            // storage.manage covers file storage operations
            options.AddPolicy(Permissions.StorageManage, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new PermissionRequirement(Permissions.StorageManage)));

            // ── Menu-access policies (legacy, used by some controllers during migration) ──
            AddMenuPolicy(options, MenuAccessPolicies.SiteSettings, "/dashboard/settings/website");
            AddMenuPolicy(options, MenuAccessPolicies.BookingManagement, "/dashboard/bookings");
            AddMenuPolicy(options, MenuAccessPolicies.ContactManagement, "/dashboard/contacts");
            AddMenuPolicy(options, MenuAccessPolicies.DoctorManagement, "/dashboard/doctors");
            AddMenuPolicy(options, MenuAccessPolicies.DepartmentManagement, "/dashboard/doctors/departments");
            AddMenuPolicy(options, MenuAccessPolicies.ArticleContent, "/dashboard/article/contents");
            AddMenuPolicy(options, MenuAccessPolicies.ArticleCategory, "/dashboard/article/categories");
            AddMenuPolicy(options, MenuAccessPolicies.SysMenu, "/dashboard/system/menus");
            AddMenuPolicy(options, MenuAccessPolicies.SysCategory, "/dashboard/system/categories");
            AddMenuPolicy(options, MenuAccessPolicies.DashboardAccess, "/dashboard");
        });

        return services;
    }

    private static void AddMenuPolicy(
        AuthorizationOptions options,
        string policyName,
        string menuUrl)
    {
        options.AddPolicy(policyName, policy =>
            policy.RequireAuthenticatedUser()
                  .AddRequirements(new MenuAccessRequirement(menuUrl)));
    }
}
