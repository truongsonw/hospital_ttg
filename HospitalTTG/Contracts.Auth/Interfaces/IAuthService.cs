using Contracts.Auth.DTOs;

namespace Contracts.Auth.Interfaces;

public interface IAuthService
{
    Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<UserDto> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<TokenResponse> RefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task LogoutAsync(Guid userId, CancellationToken ct = default);
    Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);
}
