using Shared.Abstractions.Entities;

namespace Modules.Article.Entities;

public class Content : AuditableEntity
{
    public Guid CategoryId { get; set; }
    public string ContentType { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Intro { get; set; }
    public string? Body { get; set; }
    public string? Thumbnail { get; set; }
    public string? FileAttach { get; set; }
    public string? Tags { get; set; }
    public byte Status { get; set; } = 1;
    public bool IsHot { get; set; }
    public int ViewCount { get; set; }
    public DateTime? PublishedAt { get; set; }
}
