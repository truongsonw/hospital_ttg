namespace Contracts.Auth.DTOs;

public class AssignRolePermissionsRequest
{
    public required string RoleId { get; set; }
    public required List<string> Permissions { get; set; }
}
