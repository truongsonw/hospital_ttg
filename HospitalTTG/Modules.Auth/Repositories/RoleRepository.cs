using Microsoft.EntityFrameworkCore;
using Modules.Auth.Entities;
using Shared.Infrastructure.Data;

namespace Modules.Auth.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly DbSet<Role> _dbSet;

    public RoleRepository(AppDbContext context)
    {
        _dbSet = context.Set<Role>();
    }

    public async Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken ct = default)
    {
        return await _dbSet.OrderBy(r => r.Name).ToListAsync(ct);
    }

    public async Task<Role?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _dbSet.FindAsync([id], ct);
    }
}
