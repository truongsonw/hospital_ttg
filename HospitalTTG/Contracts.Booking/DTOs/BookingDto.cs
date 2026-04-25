using Contracts.Booking.Enums;

namespace Contracts.Booking.DTOs;

public class BookingDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string? Symptoms { get; set; }
    public BookingStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
