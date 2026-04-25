using Shared.Abstractions.Entities;

namespace Modules.Storage.Entities;

public class StoredFile : AuditableEntity
{
    public string StoredFileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string PhysicalPath { get; set; } = string.Empty;
}
