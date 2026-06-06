using Shared.Abstractions.Interfaces;

namespace Modules.Doctor.Repositories;

public interface IDoctorRepository : IRepository<Entities.Doctor>
{
    Task<(IReadOnlyList<Entities.Doctor> Items, int Total)> GetPagedAsync(
        IReadOnlyList<Guid>? departmentIds, string? search, int page, int pageSize, CancellationToken ct);
    Task<IReadOnlyList<Entities.Doctor>> GetFeaturedAsync(int limit, CancellationToken ct);
    Task<IReadOnlyList<Entities.Doctor>> GetHomepageFeaturedAsync(int limit, CancellationToken ct);
    Task<IReadOnlyList<Entities.Doctor>> GetManagementAsync(CancellationToken ct);
    Task<Entities.Doctor?> GetBySlugAsync(string slug, CancellationToken ct);
    Task<IReadOnlyList<Entities.Doctor>> SearchAsync(string search, int limit, CancellationToken ct);
    Task<(IReadOnlyList<Entities.Doctor> Items, int Total)> SearchAsync(string search, int page, int pageSize, CancellationToken ct);
}
