using Contracts.Article.DTOs;
using Shared.Abstractions.Responses;

namespace Contracts.Article.Interfaces;

public interface ICategoryService
{
    Task<PagedResponse<IReadOnlyList<CategoryDto>>> GetPagedAsync(string? type, string? lang, int page, int pageSize, CancellationToken ct = default);
    Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<CategoryDto?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<CategoryDto>> GetChildrenAsync(Guid parentId, CancellationToken ct = default);
    Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default);
    Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
