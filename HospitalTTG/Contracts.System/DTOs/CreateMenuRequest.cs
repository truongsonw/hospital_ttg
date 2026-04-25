namespace Contracts.System.DTOs;

public class CreateMenuRequest
{
    public Guid? ParentId { get; set; }
    public required string Title { get; set; }
    public string? Url { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}
