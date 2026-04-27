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

    public async Task<DepartmentDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var dept = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Department), id);
        return MapToDto(dept);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentRequest request, CancellationToken ct = default)
    {
        var dept = new Entities.Department
        {
            Name = request.Name,
            Description = request.Description,
            ParentId = request.ParentId,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
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
        dept.Description = request.Description;
        dept.ParentId = request.ParentId;
        dept.SortOrder = request.SortOrder;
        dept.IsActive = request.IsActive;

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

    private static DepartmentDto MapToDto(Entities.Department d) => new()
    {
        Id = d.Id,
        Name = d.Name,
        Description = d.Description,
        ParentId = d.ParentId,
        SortOrder = d.SortOrder,
        IsActive = d.IsActive,
        CreatedAt = d.CreatedAt,
    };
}
