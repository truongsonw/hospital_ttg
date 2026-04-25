using System.ComponentModel.DataAnnotations;

namespace Contracts.Booking.DTOs;

public class CreateBookingRequest
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [MaxLength(2000)]
    public string? Symptoms { get; set; }
}
