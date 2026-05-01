using System.ComponentModel.DataAnnotations;

namespace Contracts.Mail.DTOs;

public class SendMailRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string To { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ToName { get; set; }

    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(10000)]
    public string Body { get; set; } = string.Empty;

    public bool IsBodyHtml { get; set; }
}
