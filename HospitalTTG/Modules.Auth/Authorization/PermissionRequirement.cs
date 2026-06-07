using Microsoft.AspNetCore.Authorization;

namespace Modules.Auth.Authorization;

/// <summary>
/// Requires the authenticated user to hold a specific permission
/// that is assigned to their role in the RolePermissions table.
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}
