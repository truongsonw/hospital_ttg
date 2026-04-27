using Shared.Abstractions.Interfaces;

namespace Modules.Doctor.Repositories;

public interface IDoctorRepository : IRepository<Entities.Doctor>
{
    Task<(IReadOnlyList<Entities.Doctor> Items, int Total)> GetPagedAsync(
        IReadOnlyList<Guid>? departmentIds, string? search, int page, int pageSize, CancellationToken ct);
    Task<IReadOnlyList<Entities.Doctor>> GetFeaturedAsync(int limit, CancellationToken ct);
    Task<IReadOnlyList<Entities.Doctor>> GetManagementAsync(CancellationToken ct);
}
