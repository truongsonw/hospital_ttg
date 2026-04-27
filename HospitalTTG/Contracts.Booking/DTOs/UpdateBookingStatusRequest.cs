using System.ComponentModel.DataAnnotations;
using Contracts.Booking.Enums;

namespace Contracts.Booking.DTOs;

public class UpdateBookingStatusRequest
{
    [Required]
    public BookingStatus Status { get; set; }

    [MaxLength(1000)]
    public string? Note { get; set; }
}
