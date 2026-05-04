using Contracts.System.Enums;
using Microsoft.EntityFrameworkCore;
using Modules.System.Entities;
using Shared.Infrastructure.Data;

namespace Modules.System.Repositories;

public class MenuRepository : IMenuRepository
{
    private readonly DbSet<Menu> _dbSet;

    public MenuRepository(AppDbContext context)
    {
        _dbSet = context.Set<Menu>();
    }

    public async Task<Menu?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _dbSet.FindAsync([id], ct);
    }

    public async Task<IReadOnlyList<Menu>> GetAllAsync(CancellationToken ct = default)
    {
        return await _dbSet.OrderBy(m => m.SortOrder).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Menu>> GetByTypeAsync(MenuType type, CancellationToken ct = default)
    {
        return await _dbSet
            .Where(m => m.Type == type)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Menu>> GetByParentIdAsync(Guid? parentId, CancellationToken ct = default)
    {
        return await _dbSet
            .Where(m => m.ParentId == parentId)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(ct);
    }

    public async Task<Menu> AddAsync(Menu entity, CancellationToken ct = default)
    {
        await _dbSet.AddAsync(entity, ct);
        return entity;
    }

    public void Update(Menu entity)
    {
        _dbSet.Update(entity);
    }

    public void Delete(Menu entity)
    {
        _dbSet.Remove(entity);
    }
}
