using Contracts.Article.DTOs;

namespace Contracts.Article.Interfaces;

public interface IContentMediaService
{
    Task<IReadOnlyList<ContentMediaDto>> GetByContentIdAsync(Guid contentId, CancellationToken ct = default);
    Task<ContentMediaDto> CreateAsync(CreateContentMediaRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
