namespace Contracts.System.DTOs;

public class MenuDto
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public required string Title { get; set; }
    public string? Url { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public List<MenuDto> Children { get; set; } = [];
}
