using Contracts.Auth.DTOs;

namespace Contracts.Auth.Interfaces;

public interface IRoleService
{
    Task<IReadOnlyList<RoleDto>> GetAllAsync(CancellationToken ct = default);
    Task<RoleDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<IReadOnlyList<RolePermissionDto>> GetAllPermissionsAsync(CancellationToken ct = default);
    Task<RolePermissionAssignmentDto> GetPermissionAssignmentsAsync(string roleId, CancellationToken ct = default);
    Task AssignPermissionsAsync(AssignRolePermissionsRequest request, CancellationToken ct = default);
    Task<RoleDto> CreateAsync(CreateRoleRequest request, CancellationToken ct = default);
    Task<RoleDto> UpdateAsync(string id, UpdateRoleRequest request, CancellationToken ct = default);
    Task UpdateStatusAsync(string id, bool isActive, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
}
