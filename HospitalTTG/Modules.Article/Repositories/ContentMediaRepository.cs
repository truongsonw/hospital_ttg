using Microsoft.EntityFrameworkCore;
using Modules.Article.Entities;
using Shared.Infrastructure.Data;

namespace Modules.Article.Repositories;

internal sealed class ContentMediaRepository : IContentMediaRepository
{
    private readonly DbSet<ContentMedia> _dbSet;

    public ContentMediaRepository(AppDbContext context)
    {
        _dbSet = context.Set<ContentMedia>();
    }

    public async Task<IReadOnlyList<ContentMedia>> GetByContentIdAsync(Guid contentId, CancellationToken ct = default)
        => await _dbSet.AsNoTracking().Where(x => x.ContentId == contentId).OrderBy(x => x.SortOrder).ToListAsync(ct);

    public async Task<ContentMedia?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(x => x.Id == id, ct);

    public void Add(ContentMedia media) => _dbSet.Add(media);
    public void Delete(ContentMedia media) => _dbSet.Remove(media);
}
