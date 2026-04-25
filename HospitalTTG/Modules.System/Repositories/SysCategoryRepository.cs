using Microsoft.EntityFrameworkCore;
using Modules.System.Entities;
using Shared.Infrastructure.Data;

namespace Modules.System.Repositories;

internal sealed class SysCategoryRepository : ISysCategoryRepository
{
    private readonly DbSet<SysCategory> _dbSet;

    public SysCategoryRepository(AppDbContext context)
    {
        _dbSet = context.Set<SysCategory>();
    }

    public async Task<IReadOnlyList<SysCategory>> GetAllAsync(CancellationToken ct = default)
    {
        return await _dbSet.AsNoTracking().ToListAsync(ct);
    }

    public async Task<SysCategory?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public void Add(SysCategory category)
    {
        _dbSet.Add(category);
    }

    public void Update(SysCategory category)
    {
        _dbSet.Update(category);
    }

    public void Delete(SysCategory category)
    {
        _dbSet.Remove(category);
    }
}
