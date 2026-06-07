using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace Modules.Auth;

/// <summary>
/// Requirement that a user must have access to a specific admin menu (by URL).
/// </summary>
public class MenuAccessRequirement : IAuthorizationRequirement
{
    public string MenuUrl { get; }

    public MenuAccessRequirement(string menuUrl)
    {
        MenuUrl = menuUrl;
    }
}

/// <summary>
/// Policy name constant for use with [Authorize(Policy = ...)].
/// </summary>
public static class MenuAccessPolicies
{
    public const string Prefix = "MenuAccess:";

    public static string For(string menuUrl) => $"{Prefix}{menuUrl}";

    // Convenience policy names for the most common menus
    public const string SiteSettings = $"{Prefix}/dashboard/settings/website";
    public const string BookingManagement = $"{Prefix}/dashboard/bookings";
    public const string ContactManagement = $"{Prefix}/dashboard/contacts";
    public const string DoctorManagement = $"{Prefix}/dashboard/doctors";
    public const string DepartmentManagement = $"{Prefix}/dashboard/doctors/departments";
    public const string ArticleContent = $"{Prefix}/dashboard/article/contents";
    public const string ArticleCategory = $"{Prefix}/dashboard/article/categories";
    public const string SysMenu = $"{Prefix}/dashboard/system/menus";
    public const string SysCategory = $"{Prefix}/dashboard/system/categories";
    public const string DashboardAccess = $"{Prefix}/dashboard";
}
