using Microsoft.EntityFrameworkCore;
using Shared.Infrastructure.Data;

namespace Modules.Auth.Authorization;

/// <summary>
/// Shared query result type for EF Core raw SQL queries that return a boolean.
/// The column must be aliased as "Value" in the SQL query.
/// </summary>
internal sealed class BoolResult
{
    public bool Value { get; set; }
}

/// <summary>
/// Utility methods for defensive raw SQL queries against migration-sensitive tables.
/// </summary>
internal static class RbacSqlHelper
{
    /// <summary>Checks whether the RolePermissions table exists in the database.</summary>
    public static async Task<bool> RolePermissionsTableExistsAsync(AppDbContext dbContext)
    {
        try
        {
            await dbContext.Database.ExecuteSqlRawAsync(
                "SELECT 1 FROM dbo.RolePermissions WHERE 1=0");
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Checks whether the given role has the specified permission via RolePermissions.
    /// Returns false if the table does not exist yet.
    /// </summary>
    public static async Task<bool> RoleHasPermissionAsync(
        AppDbContext dbContext,
        string roleId,
        string permission,
        CancellationToken ct = default)
    {
        try
        {
#pragma warning disable EF1003
            var result = await dbContext.Database
                .SqlQueryRaw<BoolResult>(
                    "SELECT CAST(CASE WHEN EXISTS(" +
                    "SELECT 1 FROM dbo.RolePermissions AS rp " +
                    $"WHERE rp.RoleId = '{roleId}' AND rp.Permission = '{permission}') " +
                    "THEN 1 ELSE 0 END AS BIT) AS Value")
                .FirstOrDefaultAsync(ct);
#pragma warning restore EF1003

            return result != null && result.Value;
        }
        catch
        {
            return false;
        }
    }
}
