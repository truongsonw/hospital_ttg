namespace Contracts.Article.DTOs;

public class ContentMediaDto
{
    public Guid Id { get; set; }
    public Guid ContentId { get; set; }
    public string MediaType { get; set; } = null!;
    public string Url { get; set; } = null!;
    public string? Caption { get; set; }
    public bool IsThumbnail { get; set; }
    public int SortOrder { get; set; }
}

public class CreateContentMediaRequest
{
    public Guid ContentId { get; set; }
    public string MediaType { get; set; } = null!;
    public string Url { get; set; } = null!;
    public string? Caption { get; set; }
    public bool IsThumbnail { get; set; }
    public int SortOrder { get; set; }
}
