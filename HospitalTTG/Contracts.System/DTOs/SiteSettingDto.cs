namespace Contracts.System.DTOs;

public class SiteSettingDto
{
    public string Key { get; set; } = default!;
    public string? Value { get; set; }
    public string Group { get; set; } = default!;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
