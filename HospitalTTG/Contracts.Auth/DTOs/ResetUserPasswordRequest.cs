using System.ComponentModel.DataAnnotations;

namespace Contracts.Auth.DTOs;

public class ResetUserPasswordRequest
{
    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
