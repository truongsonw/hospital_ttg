using Shared.Abstractions.Interfaces;

namespace Modules.Doctor.Repositories;

public interface IDepartmentRepository : IRepository<Entities.Department>
{
    Task<IReadOnlyList<Entities.Department>> GetAllAsync(bool? isActive, CancellationToken ct);
    Task<IReadOnlyList<Entities.Department>> GetChildrenAsync(Guid parentId, CancellationToken ct);
}
