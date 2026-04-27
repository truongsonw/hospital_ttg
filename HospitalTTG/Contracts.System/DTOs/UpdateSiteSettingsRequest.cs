namespace Contracts.System.DTOs;

public class UpdateSiteSettingsRequest
{
    public List<SiteSettingItem> Settings { get; set; } = [];
}

public class SiteSettingItem
{
    public string Key { get; set; } = default!;
    public string? Value { get; set; }
}
