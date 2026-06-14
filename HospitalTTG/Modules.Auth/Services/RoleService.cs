using Contracts.Auth.DTOs;
using Contracts.Auth.Interfaces;
using Modules.Auth.Entities;
using Modules.Auth.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

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
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RoleService(
        IRoleRepository roleRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _roleRepository = roleRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
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

    public async Task<RoleDto> CreateAsync(CreateRoleRequest request, CancellationToken ct = default)
    {
        var normalizedName = request.Name.Trim();

        if (await _roleRepository.ExistsByNameAsync(normalizedName, ct))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { nameof(request.Name), ["Tên vai trò đã tồn tại."] }
            });
        }

        var role = new Role
        {
            Id = Guid.NewGuid().ToString("N"),
            Name = normalizedName,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            IsActive = request.IsActive,
            CreatedDate = DateTime.UtcNow,
        };

        await _roleRepository.AddAsync(role, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(role);
    }

    public async Task<RoleDto> UpdateAsync(string id, UpdateRoleRequest request, CancellationToken ct = default)
    {
        var role = await _roleRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Role", id);

        var normalizedName = request.Name.Trim();
        if (await _roleRepository.ExistsByNameAsync(normalizedName, id, ct))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { nameof(request.Name), ["Tên vai trò đã tồn tại."] }
            });
        }

        role.Name = normalizedName;
        role.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        role.IsActive = request.IsActive;
        role.UpdatedDate = DateTime.UtcNow;

        _roleRepository.Update(role);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(role);
    }

    public async Task UpdateStatusAsync(string id, bool isActive, CancellationToken ct = default)
    {
        var role = await _roleRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Role", id);

        if (role.IsActive == isActive) return;

        if (!isActive)
        {
            var userCount = await _userRepository.CountByRoleAsync(role.Name, ct);
            if (userCount > 0)
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    { nameof(role.IsActive), [$"Không thể tắt vai trò đang được gán cho {userCount} người dùng."] }
                });
            }
        }

        role.IsActive = isActive;
        role.UpdatedDate = DateTime.UtcNow;
        _roleRepository.Update(role);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var role = await _roleRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Role", id);

        var userCount = await _userRepository.CountByRoleAsync(role.Name, ct);
        if (userCount > 0)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "Role", [$"Không thể xóa vai trò đang được gán cho {userCount} người dùng."] }
            });
        }

        await _roleRepository.ReplacePermissionsAsync(id, Array.Empty<string>(), ct);
        _roleRepository.Delete(role);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static RoleDto MapToDto(Role role) => new()
    {
        Id = role.Id,
        Name = role.Name,
        Description = role.Description,
        IsActive = role.IsActive,
    };
}
