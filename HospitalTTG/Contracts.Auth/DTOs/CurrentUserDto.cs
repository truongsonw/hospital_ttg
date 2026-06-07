namespace Contracts.Auth.DTOs;

/// <summary>
/// Full user info returned by GET /api/auth/me.
/// Includes the permission set so the frontend does not need to infer
/// authorization from role strings alone.
/// </summary>
public class CurrentUserDto
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public required string Role { get; set; }
    public required IReadOnlyList<string> Permissions { get; set; }
}
