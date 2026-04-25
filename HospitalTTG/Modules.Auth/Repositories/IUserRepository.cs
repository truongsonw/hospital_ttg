using Modules.Auth.Entities;
using Shared.Abstractions.Interfaces;

namespace Modules.Auth.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task<bool> ExistsByUsernameAsync(string username, CancellationToken ct = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default);
}
