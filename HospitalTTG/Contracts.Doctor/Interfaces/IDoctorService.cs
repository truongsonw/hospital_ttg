using Contracts.Doctor.DTOs;
using Shared.Abstractions.Responses;

namespace Contracts.Doctor.Interfaces;

public interface IDoctorService
{
    Task<PagedResponse<IReadOnlyList<DoctorDto>>> GetPagedAsync(
        Guid? departmentId, Guid? groupId, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<IReadOnlyList<DoctorDto>> GetFeaturedAsync(int limit = 4, CancellationToken ct = default);
    Task<IReadOnlyList<DoctorDto>> GetManagementAsync(CancellationToken ct = default);
    Task<DoctorDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<DoctorDto> CreateAsync(CreateDoctorRequest request, CancellationToken ct = default);
    Task<DoctorDto> UpdateAsync(Guid id, UpdateDoctorRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
