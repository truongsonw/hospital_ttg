namespace Contracts.System.DTOs;

public class UpdateMenuRequest
{
    public Guid? ParentMenuId { get; set; }
    public required string Title { get; set; }
    public string? Url { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public bool IsExternal { get; set; }
}
