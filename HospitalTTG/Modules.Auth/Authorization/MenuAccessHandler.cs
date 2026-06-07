using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Modules.Auth;
using Shared.Infrastructure.Data;

namespace Modules.Auth.Authorization;

internal sealed class _BoolResult
{
    public bool Value { get; set; }
}

/// <summary>
/// Handles <see cref="MenuAccessRequirement"/> by checking whether the authenticated
/// user's role has the required menu assigned in RolePermissions or RoleMenus.
/// Uses raw SQL to avoid cross-module namespace/type conflicts.
/// </summary>
public class MenuAccessHandler(AppDbContext dbContext)
    : AuthorizationHandler<MenuAccessRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        MenuAccessRequirement requirement)
    {
        var roleClaim = context.User.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrEmpty(roleClaim))
            return;

        var ct = context.Resource as CancellationToken? ?? CancellationToken.None;

        // Load all active menus to resolve menu IDs by URL.
        var allMenus = await dbContext.Database
            .SqlQuery<RawMenu>($"SELECT Id, ParentId, Url FROM dbo.Menus WHERE IsActive = 1")
            .ToListAsync(ct);

        // ── 1. Check RolePermissions for a matching permission key ──────────────
        // Only attempt this if the table exists (migration not yet run).
        var tableExists = await RbacSqlHelper.RolePermissionsTableExistsAsync(dbContext);
        if (tableExists)
        {
            var menuPolicy = MenuAccessPolicies.For(requirement.MenuUrl);
            var hasPermissionViaRolePerms = await RbacSqlHelper.RoleHasPermissionAsync(
                dbContext, roleClaim, menuPolicy, ct);

            if (hasPermissionViaRolePerms)
            {
                context.Succeed(requirement);
                return;
            }
        }

        // ── 2. Fallback: check RoleMenus for menu-based access ─────────────────
        // Legacy path used during migration. Maps menu URL -> menu ID -> RoleMenus.
        var assignedMenuIds = await dbContext.Database
            .SqlQuery<Guid>(
                $"SELECT MenuId FROM dbo.RoleMenus WHERE RoleId = '{roleClaim}' AND CanView = 1")
            .ToListAsync(ct);

        if (assignedMenuIds.Count == 0)
            return;

        var menuIds = assignedMenuIds.ToHashSet();

        // Walk parent chain: if user has access to a child menu,
        // they implicitly have access to ancestors.
        var ancestorIds = new HashSet<Guid>();
        var menuDict = allMenus.ToDictionary(m => m.Id);

        foreach (var menuId in menuIds)
        {
            var current = menuDict.GetValueOrDefault(menuId);
            while (current?.ParentId != null)
            {
                _ = ancestorIds.Add(current.ParentId.Value);
                current = menuDict.GetValueOrDefault(current.ParentId.Value);
            }
        }

        var accessibleIds = menuIds.Union(ancestorIds).ToHashSet();

        // Match: user must have access to the menu whose Url matches or prefixes
        // the requirement URL.
        var menuUrl = requirement.MenuUrl.TrimEnd('/').ToLowerInvariant();
        var matchingMenu = allMenus.FirstOrDefault(m =>
            accessibleIds.Contains(m.Id) &&
            m.Url != null &&
            (
                m.Url.TrimEnd('/').ToLowerInvariant() == menuUrl ||
                menuUrl.StartsWith(m.Url.TrimEnd('/').ToLowerInvariant() + "/")
            ));

        if (matchingMenu != null)
            context.Succeed(requirement);
    }

    private sealed class RawMenu
    {
        public Guid Id { get; set; }
        public Guid? ParentId { get; set; }
        public string? Url { get; set; }
    }
}
