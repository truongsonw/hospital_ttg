using Modules.Article.Entities;

namespace Modules.Article.Repositories;

internal interface ICategoryRepository
{
    Task<(IReadOnlyList<Category> Items, int Total)> GetPagedAsync(string? type, string? lang, int page, int pageSize, CancellationToken ct = default);
    Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<Category>> GetChildrenAsync(Guid parentId, CancellationToken ct = default);
    void Add(Category category);
    void Update(Category category);
    void Delete(Category category);
}
