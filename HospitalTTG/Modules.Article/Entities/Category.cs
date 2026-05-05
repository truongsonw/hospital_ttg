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
    public bool IsHomepageFeatured { get; set; }
    public string? HomepageSubtitle { get; set; }
    public string? HomepageDescription { get; set; }
    public string? HomepageButtonText { get; set; }
    public string? HomepageButtonUrl { get; set; }
    public int? HomepageLimit { get; set; }
}
