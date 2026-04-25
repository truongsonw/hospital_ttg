using Microsoft.EntityFrameworkCore;
using Modules.Article.Entities;
using Shared.Infrastructure.Data;

namespace Modules.Article.Repositories;

internal sealed class CategoryRepository : ICategoryRepository
{
    private readonly DbSet<Category> _dbSet;

    public CategoryRepository(AppDbContext context)
    {
        _dbSet = context.Set<Category>();
    }

    public async Task<(IReadOnlyList<Category> Items, int Total)> GetPagedAsync(
        string? type, string? lang, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _dbSet.AsNoTracking();
        if (!string.IsNullOrEmpty(type)) query = query.Where(x => x.Type == type);
        if (!string.IsNullOrEmpty(lang)) query = query.Where(x => x.Lang == lang);
        query = query.OrderBy(x => x.SortOrder);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _dbSet.AsNoTracking().FirstOrDefaultAsync(x => x.Slug == slug, ct);

    public async Task<IReadOnlyList<Category>> GetChildrenAsync(Guid parentId, CancellationToken ct = default)
        => await _dbSet.AsNoTracking().Where(x => x.ParentId == parentId).OrderBy(x => x.SortOrder).ToListAsync(ct);

    public void Add(Category category) => _dbSet.Add(category);
    public void Update(Category category) => _dbSet.Update(category);
    public void Delete(Category category) => _dbSet.Remove(category);
}
