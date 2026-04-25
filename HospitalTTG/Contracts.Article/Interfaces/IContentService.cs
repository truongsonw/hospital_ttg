using Contracts.Article.DTOs;
using Shared.Abstractions.Responses;

namespace Contracts.Article.Interfaces;

public interface IContentService
{
    Task<PagedResponse<IReadOnlyList<ContentDto>>> GetPagedAsync(string? type, Guid? categoryId, byte? status, int page, int pageSize, CancellationToken ct = default);
    Task<ContentDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ContentDto?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<PagedResponse<IReadOnlyList<ContentDto>>> GetHotAsync(int page, int pageSize, CancellationToken ct = default);
    Task IncrementViewCountAsync(Guid id, CancellationToken ct = default);
    Task<ContentDto> CreateAsync(CreateContentRequest request, CancellationToken ct = default);
    Task<ContentDto> UpdateAsync(Guid id, UpdateContentRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
