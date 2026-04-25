using Modules.Article.Entities;

namespace Modules.Article.Repositories;

internal interface IContentRepository
{
    Task<(IReadOnlyList<Content> Items, int Total)> GetPagedAsync(string? type, Guid? categoryId, byte? status, int page, int pageSize, CancellationToken ct = default);
    Task<Content?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Content?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<(IReadOnlyList<Content> Items, int Total)> GetHotPagedAsync(int page, int pageSize, CancellationToken ct = default);
    Task IncrementViewCountAsync(Guid id, CancellationToken ct = default);
    void Add(Content content);
    void Update(Content content);
    void Delete(Content content);
}
