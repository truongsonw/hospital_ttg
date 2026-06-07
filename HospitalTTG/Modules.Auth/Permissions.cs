namespace Modules.Auth;

/// <summary>
/// Defines all available permission keys in the system.
/// Permission names use resource.action format.
/// Every policy in Extensions.cs should reference one of these constants.
/// </summary>
public static class Permissions
{
    // ── Dashboard ────────────────────────────────────────────────
    public const string DashboardView = "dashboard.view";

    // ── User management ─────────────────────────────────────────
    public const string UserManage = "user.manage";
    public const string UserView   = "user.view";

    // ── Role management ─────────────────────────────────────────
    public const string RoleManage = "role.manage";
    public const string RoleView   = "role.view";

    // ── Menu management ─────────────────────────────────────────
    public const string MenuManage       = "menu.manage";
    public const string PublicMenuManage = "public_menu.manage";

    // ── System categories ────────────────────────────────────────
    public const string CategoryManage = "category.manage";

    // ── Article ─────────────────────────────────────────────────
    public const string ArticleContentManage = "article_content.manage";
    public const string ArticleMediaManage   = "article_media.manage";

    // ── Bookings ────────────────────────────────────────────────
    public const string BookingManage = "booking.manage";

    // ── Contacts ────────────────────────────────────────────────
    public const string ContactManage = "contact.manage";

    // ── Doctors & Departments ───────────────────────────────────
    public const string DoctorManage     = "doctor.manage";
    public const string DepartmentManage = "department.manage";

    // ── Site Settings ───────────────────────────────────────────
    public const string SiteSettingsManage = "site_settings.manage";

    // ── Storage (media uploads) ─────────────────────────────────
    public const string StorageManage = "storage.manage";

    /// <summary>
    /// Returns all permission constants declared above, sorted alphabetically.
    /// Used for seeding the Permissions table and for wildcard role grants.
    /// </summary>
    public static IReadOnlyList<string> All => new[]
    {
        ArticleContentManage,
        ArticleMediaManage,
        BookingManage,
        CategoryManage,
        ContactManage,
        DashboardView,
        DepartmentManage,
        DoctorManage,
        MenuManage,
        PublicMenuManage,
        RoleManage,
        RoleView,
        SiteSettingsManage,
        StorageManage,
        UserManage,
        UserView,
    };
}
