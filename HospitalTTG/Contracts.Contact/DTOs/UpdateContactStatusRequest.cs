using System.ComponentModel.DataAnnotations;
using Contracts.Contact.Enums;

namespace Contracts.Contact.DTOs;

public class UpdateContactStatusRequest
{
    [Required]
    public ContactStatus Status { get; set; }
}
