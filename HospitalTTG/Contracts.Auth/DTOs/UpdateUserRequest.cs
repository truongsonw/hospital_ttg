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
}
