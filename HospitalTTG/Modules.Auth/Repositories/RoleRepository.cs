using Microsoft.EntityFrameworkCore;
using Modules.Auth.Entities;
using Shared.Infrastructure.Data;

namespace Modules.Auth.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly AppDbContext _context;

    public RoleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Set<Role>().OrderBy(r => r.Name).ToListAsync(ct);
    }

    public async Task<Role?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.Set<Role>().FindAsync([id], ct);
    }

    public async Task<Role?> GetByNameAsync(string name, CancellationToken ct = default)
    {
        var normalized = name.Trim();
        return await _context.Set<Role>()
            .FirstOrDefaultAsync(r => r.Name == normalized, ct);
    }

    public Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default)
    {
        return ExistsByNameAsync(name, null, ct);
    }

    public async Task<bool> ExistsByNameAsync(string name, string? excludeRoleId, CancellationToken ct = default)
    {
        var normalized = name.Trim();
        var query = _context.Set<Role>().Where(r => r.Name == normalized);
        if (!string.IsNullOrEmpty(excludeRoleId))
        {
            query = query.Where(r => r.Id != excludeRoleId);
        }
        return await query.AnyAsync(ct);
    }

    public async Task<Role> AddAsync(Role role, CancellationToken ct = default)
    {
        await _context.Set<Role>().AddAsync(role, ct);
        return role;
    }

    public void Update(Role role)
    {
        _context.Set<Role>().Update(role);
    }

    public void Delete(Role role)
    {
        _context.Set<Role>().Remove(role);
    }

    public async Task<IReadOnlyList<string>> GetPermissionsByRoleAsync(string roleId, CancellationToken ct = default)
    {
        try
        {
            var sql = $"SELECT rp.Permission FROM dbo.RolePermissions AS rp WHERE rp.RoleId = '{roleId.Replace("'", "''")}'";
            return await _context.Database
                .SqlQueryRaw<string>(sql)
                .ToListAsync(ct);
        }
        catch
        {
            return Array.Empty<string>();
        }
    }

    public async Task ReplacePermissionsAsync(string roleId, IReadOnlyCollection<string> permissions, CancellationToken ct = default)
    {
        try
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM dbo.RolePermissions WHERE RoleId = {roleId}", ct);

            foreach (var permission in permissions.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"INSERT INTO dbo.RolePermissions (Id, RoleId, Permission, CreatedBy, CreatedDate) VALUES ({Guid.NewGuid()}, {roleId}, {permission}, {"system"}, {DateTime.UtcNow})",
                    ct);
            }
        }
        catch
        {
            // Table may not exist yet; let service layer stay resilient.
        }
    }
}
