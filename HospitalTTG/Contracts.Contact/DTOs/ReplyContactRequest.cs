using System.ComponentModel.DataAnnotations;

namespace Contracts.Contact.DTOs;

public class ReplyContactRequest
{
    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(10000)]
    public string Body { get; set; } = string.Empty;
}
