namespace Contracts.Doctor.DTOs;

public class CreateDepartmentRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public bool IsHomepageFeatured { get; set; } = false;
}
