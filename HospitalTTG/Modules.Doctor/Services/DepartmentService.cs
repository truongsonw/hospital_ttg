using Contracts.Doctor.DTOs;
using Contracts.Doctor.Interfaces;
using Modules.Doctor.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

namespace Modules.Doctor.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _repo;
    private readonly IUnitOfWork _uow;

    public DepartmentService(IDepartmentRepository repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync(bool? isActive = null, CancellationToken ct = default)
    {
        var items = await _repo.GetAllAsync(isActive, ct);
        return items.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<DepartmentDto>> GetChildrenAsync(Guid parentId, CancellationToken ct = default)
    {
        var items = await _repo.GetChildrenAsync(parentId, ct);
        return items.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<DepartmentDto>> GetHomepageFeaturedAsync(int limit, CancellationToken ct = default)
    {
        var items = await _repo.GetHomepageFeaturedAsync(limit, ct);
        return items.Select(MapToDto).ToList();
    }

    public async Task<DepartmentDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var dept = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Department), id);
        return MapToDto(dept);
    }

    public async Task<DepartmentDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var dept = await _repo.GetBySlugAsync(slug, ct);
        return dept == null ? null : MapToDto(dept);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentRequest request, CancellationToken ct = default)
    {
        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? GenerateSlug(request.Name)
            : request.Slug;
        var dept = new Entities.Department
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            ParentId = request.ParentId,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            IsHomepageFeatured = request.IsHomepageFeatured,
        };
        await _repo.AddAsync(dept, ct);
        await _uow.SaveChangesAsync(ct);
        return MapToDto(dept);
    }

    public async Task<DepartmentDto> UpdateAsync(Guid id, UpdateDepartmentRequest request, CancellationToken ct = default)
    {
        var dept = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Department), id);

        dept.Name = request.Name;
        dept.Slug = string.IsNullOrWhiteSpace(request.Slug) ? dept.Slug : request.Slug;
        dept.Description = request.Description;
        dept.ParentId = request.ParentId;
        dept.SortOrder = request.SortOrder;
        dept.IsActive = request.IsActive;
        dept.IsHomepageFeatured = request.IsHomepageFeatured;

        _repo.Update(dept);
        await _uow.SaveChangesAsync(ct);
        return MapToDto(dept);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var dept = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Department), id);
        _repo.Delete(dept);
        await _uow.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<DepartmentDto>> SearchAsync(string search, int limit, CancellationToken ct = default)
    {
        var items = await _repo.SearchAsync(search, limit, ct);
        return items.Select(MapToDto).ToList();
    }

    private static DepartmentDto MapToDto(Entities.Department d) => new()
    {
        Id = d.Id,
        Name = d.Name,
        Slug = d.Slug,
        Description = d.Description,
        ParentId = d.ParentId,
        SortOrder = d.SortOrder,
        IsActive = d.IsActive,
        IsHomepageFeatured = d.IsHomepageFeatured,
        CreatedAt = d.CreatedAt,
    };

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[àáạảãâầấậẩẫăằắặẳẵ]", "a");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[èéẹẻẽêềếệểễ]", "e");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[ìíịỉĩ]", "i");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[òóọỏõôồốộổỗơờớợởỡ]", "o");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[ùúụủũưừứựửữ]", "u");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[ỳýỵỷỹ]", "y");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[đ]", "d");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");
        return slug.Trim('-');
    }
}
