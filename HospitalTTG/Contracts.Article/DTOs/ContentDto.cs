namespace Contracts.Article.DTOs;

public class ContentDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string ContentType { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Intro { get; set; }
    public string? Body { get; set; }
    public string? Thumbnail { get; set; }
    public string? FileAttach { get; set; }
    public string? Tags { get; set; }
    public byte Status { get; set; }
    public bool IsHot { get; set; }
    public int ViewCount { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class CreateContentRequest
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
    public DateTime? PublishedAt { get; set; }
}

public class UpdateContentRequest
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
    public byte Status { get; set; }
    public bool IsHot { get; set; }
    public DateTime? PublishedAt { get; set; }
}
