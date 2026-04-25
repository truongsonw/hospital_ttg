using Shared.Abstractions.Entities;

namespace Modules.Article.Entities;

public class Category : AuditableEntity
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Lang { get; set; } = "vi";
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
