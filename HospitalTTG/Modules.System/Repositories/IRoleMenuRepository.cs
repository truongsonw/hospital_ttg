using Modules.System.Entities;

namespace Modules.System.Repositories;

public interface IRoleMenuRepository
{
    Task<IReadOnlyList<RoleMenu>> GetByRoleIdAsync(string roleId, CancellationToken ct = default);
    Task AddAsync(RoleMenu entity, CancellationToken ct = default);
    void DeleteRange(IEnumerable<RoleMenu> entities);
}
