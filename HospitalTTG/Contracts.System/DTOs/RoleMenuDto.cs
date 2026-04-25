namespace Contracts.System.DTOs;

public class RoleMenuDto
{
    public Guid RoleMenuId { get; set; }
    public required string RoleId { get; set; }
    public Guid MenuId { get; set; }
    public bool CanView { get; set; }
}
