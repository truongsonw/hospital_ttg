using Contracts.System.DTOs;
using Contracts.System.Interfaces;
using Modules.System.Entities;
using Modules.System.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

namespace Modules.System.Services;

public class SysCategoryService : ISysCategoryService
{
    private readonly ISysCategoryRepository _sysCategoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SysCategoryService(ISysCategoryRepository sysCategoryRepository, IUnitOfWork unitOfWork)
    {
        _sysCategoryRepository = sysCategoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SysCategoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var entities = await _sysCategoryRepository.GetAllAsync(ct);
        return entities.Select(MapToDto).ToList();
    }

    public async Task<SysCategoryDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _sysCategoryRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("SysCategory", id.ToString());

        return MapToDto(entity);
    }

    public async Task<SysCategoryDto> CreateAsync(CreateSysCategoryRequest request, CancellationToken ct = default)
    {
        var entity = new SysCategory
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Type = request.Type,
            Description = request.Description,
            Active = request.Active,
            ParentId = request.ParentId,
            Ext1s = request.Ext1s,
            Ext1d = request.Ext1d,
            CreateDTG = DateTime.UtcNow
        };

        _sysCategoryRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(entity);
    }

    public async Task<SysCategoryDto> UpdateAsync(Guid id, UpdateSysCategoryRequest request, CancellationToken ct = default)
    {
        var entity = await _sysCategoryRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("SysCategory", id.ToString());

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.Type = request.Type;
        entity.Description = request.Description;
        entity.Active = request.Active;
        entity.ParentId = request.ParentId;
        entity.Ext1s = request.Ext1s;
        entity.Ext1d = request.Ext1d;
        entity.UpdateDTG = DateTime.UtcNow;

        _sysCategoryRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _sysCategoryRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("SysCategory", id.ToString());

        entity.Deleted = true;
        entity.UpdateDTG = DateTime.UtcNow;

        _sysCategoryRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static SysCategoryDto MapToDto(SysCategory entity)
    {
        return new SysCategoryDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            Type = entity.Type,
            Description = entity.Description,
            Active = entity.Active,
            Deleted = entity.Deleted,
            CreateBy = entity.CreateBy,
            CreateDTG = entity.CreateDTG,
            UpdateBy = entity.UpdateBy,
            UpdateDTG = entity.UpdateDTG,
            ParentId = entity.ParentId,
            Ext1s = entity.Ext1s,
            Ext1d = entity.Ext1d
        };
    }
}
