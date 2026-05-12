namespace Contracts.Search.DTOs;

public class SearchResultDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty; // "doctor" | "article" | "department"
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Thumbnail { get; set; }
    public string Url { get; set; } = string.Empty;
    public DateTime? PublishedAt { get; set; }
}

public class SearchResponseDto
{
    public IReadOnlyList<SearchResultDto> Doctors { get; set; } = [];
    public IReadOnlyList<SearchResultDto> Articles { get; set; } = [];
    public IReadOnlyList<SearchResultDto> Departments { get; set; } = [];
    public string Query { get; set; } = string.Empty;
}

public class SearchSuggestItemDto
{
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}
