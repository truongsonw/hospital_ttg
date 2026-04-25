using Contracts.Article.DTOs;
using Contracts.Article.Interfaces;
using Modules.Article.Entities;
using Modules.Article.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;
using Shared.Abstractions.Responses;

namespace Modules.Article.Services;

internal sealed class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(ICategoryRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResponse<IReadOnlyList<CategoryDto>>> GetPagedAsync(
        string? type, string? lang, int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _repository.GetPagedAsync(type, lang, page, pageSize, ct);
        return new PagedResponse<IReadOnlyList<CategoryDto>>(items.Select(MapToDto).ToList(), page, pageSize, total);
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<CategoryDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var entity = await _repository.GetBySlugAsync(slug, ct);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IReadOnlyList<CategoryDto>> GetChildrenAsync(Guid parentId, CancellationToken ct = default)
    {
        var items = await _repository.GetChildrenAsync(parentId, ct);
        return items.Select(MapToDto).ToList();
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var entity = new Category
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Slug = request.Slug,
            Type = request.Type,
            Lang = request.Lang,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _repository.Add(entity);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(entity);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Category", id);

        entity.ParentId = request.ParentId;
        entity.Name = request.Name;
        entity.Slug = request.Slug;
        entity.Type = request.Type;
        entity.Lang = request.Lang;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Category", id);

        _repository.Delete(entity);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static CategoryDto MapToDto(Category e) => new()
    {
        Id = e.Id,
        ParentId = e.ParentId,
        Name = e.Name,
        Slug = e.Slug,
        Type = e.Type,
        Lang = e.Lang,
        SortOrder = e.SortOrder,
        IsActive = e.IsActive
    };
}
