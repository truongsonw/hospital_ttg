using Modules.Auth.Entities;

namespace Modules.Auth.Repositories;

public interface IRoleRepository
{
    Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken ct = default);
    Task<Role?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<Role?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(string name, string? excludeRoleId, CancellationToken ct = default);
    Task<Role> AddAsync(Role role, CancellationToken ct = default);
    void Update(Role role);
    void Delete(Role role);
    Task<IReadOnlyList<string>> GetPermissionsByRoleAsync(string roleId, CancellationToken ct = default);
    Task ReplacePermissionsAsync(string roleId, IReadOnlyCollection<string> permissions, CancellationToken ct = default);
}
