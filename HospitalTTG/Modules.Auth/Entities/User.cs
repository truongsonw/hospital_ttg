using Shared.Abstractions.Entities;

namespace Modules.Auth.Entities;

public class User : AuditableEntity
{
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public string Role { get; set; } = "User";
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public bool IsActive { get; set; } = true;
}
