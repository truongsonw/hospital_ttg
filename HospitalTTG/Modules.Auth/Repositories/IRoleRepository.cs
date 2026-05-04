using Modules.Auth.Entities;

namespace Modules.Auth.Repositories;

public interface IRoleRepository
{
    Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken ct = default);
    Task<Role?> GetByIdAsync(string id, CancellationToken ct = default);
}
