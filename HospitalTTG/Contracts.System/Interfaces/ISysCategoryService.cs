using Contracts.System.DTOs;

namespace Contracts.System.Interfaces;

public interface ISysCategoryService
{
    Task<IReadOnlyList<SysCategoryDto>> GetAllAsync(CancellationToken ct = default);
    Task<SysCategoryDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<SysCategoryDto> CreateAsync(CreateSysCategoryRequest request, CancellationToken ct = default);
    Task<SysCategoryDto> UpdateAsync(Guid id, UpdateSysCategoryRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
