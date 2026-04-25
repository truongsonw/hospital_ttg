using Microsoft.EntityFrameworkCore;
using Modules.Article.Entities;
using Shared.Infrastructure.Data;

namespace Modules.Article.Repositories;

internal sealed class ContentRepository : IContentRepository
{
    private readonly DbSet<Content> _dbSet;

    public ContentRepository(AppDbContext context)
    {
        _dbSet = context.Set<Content>();
    }

    public async Task<(IReadOnlyList<Content> Items, int Total)> GetPagedAsync(
        string? type, Guid? categoryId, byte? status, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _dbSet.AsNoTracking();
        if (!string.IsNullOrEmpty(type)) query = query.Where(x => x.ContentType == type);
        if (categoryId.HasValue) query = query.Where(x => x.CategoryId == categoryId.Value);
        if (status.HasValue) query = query.Where(x => x.Status == status.Value);
        query = query.OrderByDescending(x => x.PublishedAt);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Content?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<Content?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _dbSet.AsNoTracking().FirstOrDefaultAsync(x => x.Slug == slug, ct);

    public async Task<(IReadOnlyList<Content> Items, int Total)> GetHotPagedAsync(
        int page, int pageSize, CancellationToken ct = default)
    {
        var query = _dbSet.AsNoTracking().Where(x => x.IsHot && x.Status == 1)
            .OrderByDescending(x => x.PublishedAt);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task IncrementViewCountAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.Where(x => x.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(e => e.ViewCount, e => e.ViewCount + 1), ct);

    public void Add(Content content) => _dbSet.Add(content);
    public void Update(Content content) => _dbSet.Update(content);
    public void Delete(Content content) => _dbSet.Remove(content);
}
