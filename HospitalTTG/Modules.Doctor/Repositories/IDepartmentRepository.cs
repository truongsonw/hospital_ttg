using Shared.Abstractions.Interfaces;

namespace Modules.Doctor.Repositories;

public interface IDepartmentRepository : IRepository<Entities.Department>
{
    Task<IReadOnlyList<Entities.Department>> GetAllAsync(bool? isActive, CancellationToken ct);
    Task<IReadOnlyList<Entities.Department>> GetChildrenAsync(Guid parentId, CancellationToken ct);
    Task<IReadOnlyList<Entities.Department>> GetHomepageFeaturedAsync(int limit, CancellationToken ct);
    Task<Entities.Department?> GetBySlugAsync(string slug, CancellationToken ct);
    Task<IReadOnlyList<Guid>> GetChildrenIdsByGroupSlugAsync(string groupSlug, CancellationToken ct);
    Task<IReadOnlyList<Entities.Department>> SearchAsync(string search, int limit, CancellationToken ct);
}
