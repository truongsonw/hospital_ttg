using Contracts.System.Enums;
using Shared.Abstractions.Entities;

namespace Modules.System.Entities;

public class Menu : BaseTrackingEntity
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public MenuType Type { get; set; } = MenuType.Admin;
}
