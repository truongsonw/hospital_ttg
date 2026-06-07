namespace Contracts.Auth.DTOs;

public class RolePermissionAssignmentDto
{
    public required string RoleId { get; set; }
    public required IReadOnlyList<string> Permissions { get; set; }
}
