using System.ComponentModel.DataAnnotations;

namespace Contracts.Auth.DTOs;

public class UpdateUserStatusRequest
{
    [Required]
    public bool IsActive { get; set; }
}
