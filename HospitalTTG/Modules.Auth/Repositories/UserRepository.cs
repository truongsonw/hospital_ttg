using Microsoft.EntityFrameworkCore;
using Modules.Auth.Entities;
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
        return await DbSet.AnyAsync(u => u.Username == username, ct);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default)
    {
        return await DbSet.AnyAsync(u => u.Email == email, ct);
    }
}
