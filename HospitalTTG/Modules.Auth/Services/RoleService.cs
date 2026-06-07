using Contracts.Auth.DTOs;
using Contracts.Auth.Interfaces;
using Modules.Auth.Repositories;
using Shared.Abstractions.Exceptions;

namespace Modules.Auth.Services;

public class RoleService : IRoleService
{
    private static readonly IReadOnlyDictionary<string, string> PermissionDescriptions =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [Permissions.DashboardView] = "Xem tổng quan dashboard",
            [Permissions.UserManage] = "Quản lý người dùng",
            [Permissions.UserView] = "Xem danh sách người dùng",
            [Permissions.RoleManage] = "Quản lý vai trò",
            [Permissions.RoleView] = "Xem danh sách vai trò",
            [Permissions.MenuManage] = "Quản lý menu quản trị",
            [Permissions.PublicMenuManage] = "Quản lý menu website công khai",
            [Permissions.CategoryManage] = "Quản lý danh mục hệ thống",
            [Permissions.ArticleContentManage] = "Quản lý nội dung bài viết",
            [Permissions.ArticleMediaManage] = "Quản lý media bài viết",
            [Permissions.BookingManage] = "Quản lý lịch đặt khám",
            [Permissions.ContactManage] = "Quản lý liên hệ",
            [Permissions.DoctorManage] = "Quản lý bác sĩ",
            [Permissions.DepartmentManage] = "Quản lý khoa phòng",
            [Permissions.SiteSettingsManage] = "Quản lý cài đặt website",
            [Permissions.StorageManage] = "Quản lý kho tệp",
        };

    private readonly IRoleRepository _roleRepository;

    public RoleService(IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
    }

    public async Task<IReadOnlyList<RoleDto>> GetAllAsync(CancellationToken ct = default)
    {
        var roles = await _roleRepository.GetAllAsync(ct);
        return roles
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsActive = r.IsActive,
            })
            .ToList();
    }

    public async Task<RoleDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var role = await _roleRepository.GetByIdAsync(id, ct);
        if (role is null) return null;
        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            IsActive = role.IsActive,
        };
    }

    public Task<IReadOnlyList<RolePermissionDto>> GetAllPermissionsAsync(CancellationToken ct = default)
    {
        IReadOnlyList<RolePermissionDto> permissions = Permissions.All
            .Select(permission => new RolePermissionDto
            {
                Key = permission,
                Description = PermissionDescriptions.TryGetValue(permission, out var description)
                    ? description
                    : permission,
            })
            .OrderBy(permission => permission.Key)
            .ToList();

        return Task.FromResult(permissions);
    }

    public async Task<RolePermissionAssignmentDto> GetPermissionAssignmentsAsync(string roleId, CancellationToken ct = default)
    {
        var role = await _roleRepository.GetByIdAsync(roleId, ct);
        if (role is null)
            throw new NotFoundException("Role", roleId);

        var permissions = await _roleRepository.GetPermissionsByRoleAsync(roleId, ct);
        return new RolePermissionAssignmentDto
        {
            RoleId = roleId,
            Permissions = permissions.OrderBy(static permission => permission).ToList(),
        };
    }

    public async Task AssignPermissionsAsync(AssignRolePermissionsRequest request, CancellationToken ct = default)
    {
        var role = await _roleRepository.GetByIdAsync(request.RoleId, ct);
        if (role is null)
            throw new NotFoundException("Role", request.RoleId);

        var normalizedPermissions = request.Permissions
            .Where(static permission => !string.IsNullOrWhiteSpace(permission))
            .Select(static permission => permission.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var invalidPermissions = normalizedPermissions
            .Where(permission => !Permissions.All.Contains(permission, StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (invalidPermissions.Count > 0)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                [nameof(request.Permissions)] = [$"Quyền không hợp lệ: {string.Join(", ", invalidPermissions)}"]
            });

        await _roleRepository.ReplacePermissionsAsync(request.RoleId, normalizedPermissions, ct);
    }
}
