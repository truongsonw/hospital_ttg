using Contracts.Doctor.DTOs;

namespace Contracts.Doctor.Interfaces;

public interface IDepartmentService
{
    Task<IReadOnlyList<DepartmentDto>> GetAllAsync(bool? isActive = null, CancellationToken ct = default);
    Task<IReadOnlyList<DepartmentDto>> GetChildrenAsync(Guid parentId, CancellationToken ct = default);
    Task<IReadOnlyList<DepartmentDto>> GetHomepageFeaturedAsync(int limit, CancellationToken ct = default);
    Task<DepartmentDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<DepartmentDto?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<DepartmentDto> CreateAsync(CreateDepartmentRequest request, CancellationToken ct = default);
    Task<DepartmentDto> UpdateAsync(Guid id, UpdateDepartmentRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<DepartmentDto>> SearchAsync(string search, int limit, CancellationToken ct = default);
}
