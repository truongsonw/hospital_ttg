using System.ComponentModel.DataAnnotations;

namespace Contracts.Auth.DTOs;

public class UpdateRoleRequest
{
    [Required]
    [MaxLength(200, ErrorMessage = "Tên vai trò tối đa 200 ký tự.")]
    [MinLength(1, ErrorMessage = "Vui lòng nhập tên vai trò.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Mô tả tối đa 500 ký tự.")]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
}
