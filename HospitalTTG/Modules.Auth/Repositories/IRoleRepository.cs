using Modules.Auth.Entities;

namespace Modules.Auth.Repositories;

public interface IRoleRepository
{
    Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken ct = default);
    Task<Role?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetPermissionsByRoleAsync(string roleId, CancellationToken ct = default);
    Task ReplacePermissionsAsync(string roleId, IReadOnlyCollection<string> permissions, CancellationToken ct = default);
}
