namespace Modules.System.Entities;

public class RoleMenu
{
    public Guid Id { get; set; }
    public string RoleId { get; set; } = string.Empty;
    public Guid MenuId { get; set; }
    public bool CanView { get; set; } = true;
    public string? CreatedBy { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}
