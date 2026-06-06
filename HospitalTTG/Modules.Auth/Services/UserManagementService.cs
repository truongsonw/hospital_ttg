using Contracts.Auth.DTOs;
using Contracts.Auth.Interfaces;
using Modules.Auth.Entities;
using Modules.Auth.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;
using Shared.Abstractions.Responses;

namespace Modules.Auth.Services;

public class UserManagementService : IUserManagementService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserManagementService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResponse<IReadOnlyList<UserListItemDto>>> GetPagedAsync(
        string? keyword,
        string? role,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : pageSize;

        var users = await _userRepository.GetAllAsync(ct);
        var query = users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var normalizedKeyword = keyword.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.Username.ToLower().Contains(normalizedKeyword) ||
                u.Email.ToLower().Contains(normalizedKeyword) ||
                u.FullName.ToLower().Contains(normalizedKeyword));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            var normalizedRole = role.Trim().ToLowerInvariant();
            query = query.Where(u => u.Role.ToLower() == normalizedRole);
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        var totalRecords = query.Count();
        var items = query
            .OrderByDescending(u => u.CreatedAt)
            .ThenBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapListItem)
            .ToList();

        return new PagedResponse<IReadOnlyList<UserListItemDto>>(items, page, pageSize, totalRecords);
    }

    public async Task<UserDetailDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await GetUserOrThrowAsync(id, ct);
        return MapDetail(user);
    }

    public async Task<UserDetailDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        await ValidateRoleAsync(request.Role, ct);
        await ValidateUniqueForCreateAsync(request.Username, request.Email, ct);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username.Trim(),
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            Role = request.Role.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = request.IsActive,
        };

        await _userRepository.AddAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapDetail(user);
    }

    public async Task<UserDetailDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default)
    {
        var user = await GetUserOrThrowAsync(id, ct);

        await ValidateRoleAsync(request.Role, ct);
        await ValidateUniqueForUpdateAsync(request.Email, user.Id, ct);

        user.Email = request.Email.Trim();
        user.FullName = request.FullName.Trim();
        user.Role = request.Role.Trim();
        user.IsActive = request.IsActive;

        if (!user.IsActive)
        {
            RevokeRefreshToken(user);
        }

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapDetail(user);
    }

    public async Task UpdateStatusAsync(Guid id, UpdateUserStatusRequest request, Guid currentUserId, CancellationToken ct = default)
    {
        var user = await GetUserOrThrowAsync(id, ct);

        if (user.Id == currentUserId && !request.IsActive)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "IsActive", ["Không thể tự khóa tài khoản đang đăng nhập."] }
            });
        }

        user.IsActive = request.IsActive;
        if (!user.IsActive)
        {
            RevokeRefreshToken(user);
        }

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task ResetPasswordAsync(Guid id, ResetUserPasswordRequest request, Guid currentUserId, CancellationToken ct = default)
    {
        var user = await GetUserOrThrowAsync(id, ct);

        if (user.Id == currentUserId)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "NewPassword", ["Vui lòng dùng chức năng đổi mật khẩu cho tài khoản hiện tại."] }
            });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        RevokeRefreshToken(user);

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private async Task<User> GetUserOrThrowAsync(Guid id, CancellationToken ct)
    {
        return await _userRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("User", id);
    }

    private async Task ValidateRoleAsync(string role, CancellationToken ct)
    {
        var normalizedRole = role.Trim();
        var existingRole = await _roleRepository.GetByIdAsync(normalizedRole, ct);
        if (existingRole is null || !existingRole.IsActive)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "Role", ["Vai trò không hợp lệ hoặc đã ngừng hoạt động."] }
            });
        }
    }

    private async Task ValidateUniqueForCreateAsync(string username, string email, CancellationToken ct)
    {
        if (await _userRepository.ExistsByUsernameAsync(username.Trim(), ct))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "Username", ["Tên đăng nhập đã tồn tại."] }
            });
        }

        await ValidateUniqueForUpdateAsync(email, null, ct);
    }

    private async Task ValidateUniqueForUpdateAsync(string email, Guid? excludeUserId, CancellationToken ct)
    {
        if (await _userRepository.ExistsByEmailAsync(email.Trim(), excludeUserId, ct))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "Email", ["Email đã tồn tại."] }
            });
        }
    }

    private static void RevokeRefreshToken(User user)
    {
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
    }

    private static UserListItemDto MapListItem(User user)
    {
        return new UserListItemDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
        };
    }

    private static UserDetailDto MapDetail(User user)
    {
        return new UserDetailDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            CreatedBy = user.CreatedBy,
            UpdatedBy = user.UpdatedBy,
        };
    }
}
