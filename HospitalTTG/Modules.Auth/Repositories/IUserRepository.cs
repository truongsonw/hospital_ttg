using Contracts.Auth.DTOs;
using Modules.Auth.Entities;
using Shared.Abstractions.Interfaces;
using Shared.Abstractions.Responses;

namespace Modules.Auth.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task<bool> ExistsByUsernameAsync(string username, CancellationToken ct = default);
    Task<bool> ExistsByUsernameAsync(string username, Guid? excludeUserId, CancellationToken ct = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> ExistsByEmailAsync(string email, Guid? excludeUserId, CancellationToken ct = default);
    Task<PagedResponse<IReadOnlyList<UserListItemDto>>> GetPagedAsync(
        string? keyword,
        string? role,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<int> CountByRoleAsync(string role, CancellationToken ct = default);
}
