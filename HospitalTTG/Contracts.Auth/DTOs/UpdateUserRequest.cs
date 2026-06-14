using System.ComponentModel.DataAnnotations;

namespace Contracts.Auth.DTOs;

public class UpdateUserRequest
{
    [Required]
    [MaxLength(256)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Role { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    /// <summary>
    /// Optional new password. Leave null/empty to keep the current password.
    /// When provided, must be at least 8 characters and will be BCrypt-hashed server-side.
    /// </summary>
    [MinLength(8)]
    public string? Password { get; set; }
}
