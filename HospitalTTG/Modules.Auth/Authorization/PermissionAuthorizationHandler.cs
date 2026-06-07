using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Shared.Infrastructure.Data;

namespace Modules.Auth.Authorization;

/// <summary>
/// Handles <see cref="PermissionRequirement"/> by checking whether the
/// authenticated user's role has the required permission in RolePermissions.
/// Falls back to deny (does not succeed) if the table does not exist yet.
/// Uses raw SQL to avoid cross-module namespace conflicts.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly AppDbContext _dbContext;

    public PermissionAuthorizationHandler(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var roleClaim = context.User.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrEmpty(roleClaim))
            return;

        var ct = context.Resource as CancellationToken? ?? CancellationToken.None;

        var hasPermission = await RbacSqlHelper.RoleHasPermissionAsync(
            _dbContext, roleClaim, requirement.Permission, ct);

        if (hasPermission)
            context.Succeed(requirement);
    }
}
