using Contracts.Auth.DTOs;

namespace Contracts.Auth.Interfaces;

public interface IRoleService
{
    Task<IReadOnlyList<RoleDto>> GetAllAsync(CancellationToken ct = default);
}
