namespace Contracts.System.DTOs;

public class AssignRoleMenuRequest
{
    public required string RoleId { get; set; }
    public required List<Guid> MenuIds { get; set; }
}
