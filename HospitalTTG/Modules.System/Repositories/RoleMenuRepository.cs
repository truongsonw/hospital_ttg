using Microsoft.EntityFrameworkCore;
using Modules.System.Entities;
using Shared.Infrastructure.Data;

namespace Modules.System.Repositories;

public class RoleMenuRepository : IRoleMenuRepository
{
    private readonly DbSet<RoleMenu> _dbSet;

    public RoleMenuRepository(AppDbContext context)
    {
        _dbSet = context.Set<RoleMenu>();
    }

    public async Task<IReadOnlyList<RoleMenu>> GetByRoleIdAsync(string roleId, CancellationToken ct = default)
    {
        return await _dbSet
            .Where(rm => rm.RoleId == roleId)
            .ToListAsync(ct);
    }

    public async Task AddAsync(RoleMenu entity, CancellationToken ct = default)
    {
        await _dbSet.AddAsync(entity, ct);
    }

    public void DeleteRange(IEnumerable<RoleMenu> entities)
    {
        _dbSet.RemoveRange(entities);
    }
}
