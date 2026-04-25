using Contracts.Article.DTOs;
using Contracts.Article.Interfaces;
using Modules.Article.Entities;
using Modules.Article.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;
using Shared.Abstractions.Responses;

namespace Modules.Article.Services;

internal sealed class ContentService : IContentService
{
    private readonly IContentRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ContentService(IContentRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResponse<IReadOnlyList<ContentDto>>> GetPagedAsync(
        string? type, Guid? categoryId, byte? status, int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _repository.GetPagedAsync(type, categoryId, status, page, pageSize, ct);
        return new PagedResponse<IReadOnlyList<ContentDto>>(items.Select(MapToDto).ToList(), page, pageSize, total);
    }

    public async Task<ContentDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<ContentDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var entity = await _repository.GetBySlugAsync(slug, ct);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<PagedResponse<IReadOnlyList<ContentDto>>> GetHotAsync(
        int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _repository.GetHotPagedAsync(page, pageSize, ct);
        return new PagedResponse<IReadOnlyList<ContentDto>>(items.Select(MapToDto).ToList(), page, pageSize, total);
    }

    public async Task IncrementViewCountAsync(Guid id, CancellationToken ct = default)
        => await _repository.IncrementViewCountAsync(id, ct);

    public async Task<ContentDto> CreateAsync(CreateContentRequest request, CancellationToken ct = default)
    {
        var entity = new Content
        {
            CategoryId = request.CategoryId,
            ContentType = request.ContentType,
            Title = request.Title,
            Slug = request.Slug,
            Intro = request.Intro,
            Body = request.Body,
            Thumbnail = request.Thumbnail,
            FileAttach = request.FileAttach,
            Tags = request.Tags,
            Status = request.Status,
            IsHot = request.IsHot,
            PublishedAt = request.PublishedAt
        };

        _repository.Add(entity);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(entity);
    }

    public async Task<ContentDto> UpdateAsync(Guid id, UpdateContentRequest request, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Content", id);

        entity.CategoryId = request.CategoryId;
        entity.ContentType = request.ContentType;
        entity.Title = request.Title;
        entity.Slug = request.Slug;
        entity.Intro = request.Intro;
        entity.Body = request.Body;
        entity.Thumbnail = request.Thumbnail;
        entity.FileAttach = request.FileAttach;
        entity.Tags = request.Tags;
        entity.Status = request.Status;
        entity.IsHot = request.IsHot;
        entity.PublishedAt = request.PublishedAt;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Content", id);

        _repository.Delete(entity);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static ContentDto MapToDto(Content e) => new()
    {
        Id = e.Id,
        CategoryId = e.CategoryId,
        ContentType = e.ContentType,
        Title = e.Title,
        Slug = e.Slug,
        Intro = e.Intro,
        Body = e.Body,
        Thumbnail = e.Thumbnail,
        FileAttach = e.FileAttach,
        Tags = e.Tags,
        Status = e.Status,
        IsHot = e.IsHot,
        ViewCount = e.ViewCount,
        PublishedAt = e.PublishedAt
    };
}
