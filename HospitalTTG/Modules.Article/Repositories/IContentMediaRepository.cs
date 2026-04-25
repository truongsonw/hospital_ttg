using Modules.Article.Entities;

namespace Modules.Article.Repositories;

internal interface IContentMediaRepository
{
    Task<IReadOnlyList<ContentMedia>> GetByContentIdAsync(Guid contentId, CancellationToken ct = default);
    Task<ContentMedia?> GetByIdAsync(Guid id, CancellationToken ct = default);
    void Add(ContentMedia media);
    void Delete(ContentMedia media);
}
