using Contracts.Contact.Enums;
using Shared.Abstractions.Entities;

namespace Modules.Contact.Entities;

public class Contact : AuditableEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public ContactStatus Status { get; set; } = ContactStatus.Unread;
}
