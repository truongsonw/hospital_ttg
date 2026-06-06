using Contracts.Auth.DTOs;
using Shared.Abstractions.Responses;

namespace Contracts.Auth.Interfaces;

public interface IUserManagementService
{
    Task<PagedResponse<IReadOnlyList<UserListItemDto>>> GetPagedAsync(
        string? keyword,
        string? role,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<UserDetailDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserDetailDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default);
    Task<UserDetailDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default);
    Task UpdateStatusAsync(Guid id, UpdateUserStatusRequest request, Guid currentUserId, CancellationToken ct = default);
    Task ResetPasswordAsync(Guid id, ResetUserPasswordRequest request, Guid currentUserId, CancellationToken ct = default);
}
