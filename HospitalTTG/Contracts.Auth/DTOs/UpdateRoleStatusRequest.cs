using System.ComponentModel.DataAnnotations;

namespace Contracts.Auth.DTOs;

public class UpdateRoleStatusRequest
{
    [Required]
    public bool IsActive { get; set; }
}
