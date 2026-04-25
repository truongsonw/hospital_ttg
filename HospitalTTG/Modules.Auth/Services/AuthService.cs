using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Contracts.Auth.DTOs;
using Contracts.Auth.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Modules.Auth.Entities;
using Modules.Auth.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

namespace Modules.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository userRepository, IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByUsernameAsync(request.Username, ct)
            ?? throw new NotFoundException("User", request.Username);

        if (!user.IsActive)
            throw new ValidationException(
                new Dictionary<string, string[]> { { "Username", ["Account is disabled."] } });

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new ValidationException(
                new Dictionary<string, string[]> { { "Password", ["Invalid password."] } });

        var token = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            _configuration.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7));

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);

        return new TokenResponse
        {
            AccessToken = token,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(
                _configuration.GetValue<int>("Jwt:ExpiryMinutes", 60))
        };
    }

    public async Task<UserDto> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await _userRepository.ExistsByUsernameAsync(request.Username, ct))
            throw new ValidationException(
                new Dictionary<string, string[]> { { "Username", ["Username already exists."] } });

        if (await _userRepository.ExistsByEmailAsync(request.Email, ct))
            throw new ValidationException(
                new Dictionary<string, string[]> { { "Email", ["Email already exists."] } });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Email = request.Email,
            FullName = request.FullName
        };

        await _userRepository.AddAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role
        };
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(refreshToken, ct)
            ?? throw new ValidationException(
                new Dictionary<string, string[]> { { "RefreshToken", ["Invalid refresh token."] } });

        if (!user.IsActive)
            throw new ValidationException(
                new Dictionary<string, string[]> { { "RefreshToken", ["Account is disabled."] } });

        if (user.RefreshTokenExpiryTime < DateTime.UtcNow)
            throw new ValidationException(
                new Dictionary<string, string[]> { { "RefreshToken", ["Refresh token expired."] } });

        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            _configuration.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7));

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);

        return new TokenResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(
                _configuration.GetValue<int>("Jwt:ExpiryMinutes", 60))
        };
    }

    public async Task LogoutAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("User", userId);

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("User", userId);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role
        };
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("User", userId);

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            throw new ValidationException(
                new Dictionary<string, string[]> { { "CurrentPassword", ["Current password is incorrect."] } });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                _configuration.GetValue<int>("Jwt:ExpiryMinutes", 60)),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}
