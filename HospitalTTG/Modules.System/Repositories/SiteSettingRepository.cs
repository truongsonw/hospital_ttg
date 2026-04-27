using Microsoft.EntityFrameworkCore;
using Modules.System.Entities;
using Shared.Infrastructure.Data;

namespace Modules.System.Repositories;

internal sealed class SiteSettingRepository : ISiteSettingRepository
{
    private readonly DbSet<SiteSetting> _dbSet;

    public SiteSettingRepository(AppDbContext context)
    {
        _dbSet = context.Set<SiteSetting>();
    }

    public async Task<IReadOnlyList<SiteSetting>> GetAllAsync(CancellationToken ct = default)
    {
        return await _dbSet.AsNoTracking().OrderBy(x => x.Group).ThenBy(x => x.Key).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SiteSetting>> GetByGroupAsync(string group, CancellationToken ct = default)
    {
        return await _dbSet.AsNoTracking().Where(x => x.Group == group).OrderBy(x => x.Key).ToListAsync(ct);
    }

    public async Task<SiteSetting?> GetByKeyAsync(string key, CancellationToken ct = default)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.Key == key, ct);
    }

    public void Add(SiteSetting setting)
    {
        _dbSet.Add(setting);
    }

    public void Update(SiteSetting setting)
    {
        _dbSet.Update(setting);
    }
}
