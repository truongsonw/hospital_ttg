using Contracts.Contact.Enums;

namespace Contracts.Contact.DTOs;

public class ContactDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public ContactStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
