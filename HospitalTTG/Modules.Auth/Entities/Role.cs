using Shared.Abstractions.Entities;

namespace Modules.Auth.Entities;

public class Role : BaseTrackingEntity
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
