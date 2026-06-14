using Contracts.Auth.DTOs;
using Microsoft.EntityFrameworkCore;
using Modules.Auth.Entities;
using Shared.Abstractions.Responses;
using Shared.Infrastructure.Data;

namespace Modules.Auth.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        return await DbSet.FirstOrDefaultAsync(u => u.Username == username, ct);
    }

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        return await DbSet.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken, ct);
    }

    public async Task<bool> ExistsByUsernameAsync(string username, CancellationToken ct = default)
    {
        return await ExistsByUsernameAsync(username, null, ct);
    }

    public async Task<bool> ExistsByUsernameAsync(string username, Guid? excludeUserId, CancellationToken ct = default)
    {
        return await DbSet.AnyAsync(
            u => u.Username == username && (!excludeUserId.HasValue || u.Id != excludeUserId.Value),
            ct);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default)
    {
        return await ExistsByEmailAsync(email, null, ct);
    }

    public async Task<bool> ExistsByEmailAsync(string email, Guid? excludeUserId, CancellationToken ct = default)
    {
        return await DbSet.AnyAsync(
            u => u.Email == email && (!excludeUserId.HasValue || u.Id != excludeUserId.Value),
            ct);
    }

    public async Task<PagedResponse<IReadOnlyList<UserListItemDto>>> GetPagedAsync(
        string? keyword,
        string? role,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = DbSet.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var normalizedKeyword = keyword.Trim();
            query = query.Where(u =>
                u.Username.Contains(normalizedKeyword) ||
                u.Email.Contains(normalizedKeyword) ||
                u.FullName.Contains(normalizedKeyword));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            var normalizedRole = role.Trim();
            query = query.Where(u => u.Role == normalizedRole);
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        var totalRecords = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .ThenBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListItemDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
            })
            .ToListAsync(ct);

        return new PagedResponse<IReadOnlyList<UserListItemDto>>(items, page, pageSize, totalRecords);
    }

    public Task<int> CountByRoleAsync(string role, CancellationToken ct = default)
    {
        var normalizedRole = role.Trim();
        return DbSet.CountAsync(u => u.Role == normalizedRole, ct);
    }
}
