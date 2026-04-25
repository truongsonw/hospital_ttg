using Contracts.Article.DTOs;
using Contracts.Article.Interfaces;
using Modules.Article.Entities;
using Modules.Article.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

namespace Modules.Article.Services;

internal sealed class ContentMediaService : IContentMediaService
{
    private readonly IContentMediaRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ContentMediaService(IContentMediaRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ContentMediaDto>> GetByContentIdAsync(Guid contentId, CancellationToken ct = default)
    {
        var entities = await _repository.GetByContentIdAsync(contentId, ct);
        return entities.Select(MapToDto).ToList();
    }

    public async Task<ContentMediaDto> CreateAsync(CreateContentMediaRequest request, CancellationToken ct = default)
    {
        var entity = new ContentMedia
        {
            ContentId = request.ContentId,
            MediaType = request.MediaType,
            Url = request.Url,
            Caption = request.Caption,
            IsThumbnail = request.IsThumbnail,
            SortOrder = request.SortOrder
        };

        _repository.Add(entity);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("ContentMedia", id);

        _repository.Delete(entity);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static ContentMediaDto MapToDto(ContentMedia e) => new()
    {
        Id = e.Id,
        ContentId = e.ContentId,
        MediaType = e.MediaType,
        Url = e.Url,
        Caption = e.Caption,
        IsThumbnail = e.IsThumbnail,
        SortOrder = e.SortOrder
    };
}
