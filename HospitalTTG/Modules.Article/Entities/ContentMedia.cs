using Shared.Abstractions.Entities;

namespace Modules.Article.Entities;

public class ContentMedia : BaseEntity
{
    public Guid ContentId { get; set; }
    public string MediaType { get; set; } = null!;
    public string Url { get; set; } = null!;
    public string? Caption { get; set; }
    public bool IsThumbnail { get; set; }
    public int SortOrder { get; set; }
}
