using Contracts.Booking.Enums;
using Shared.Abstractions.Entities;

namespace Modules.Booking.Entities;

public class Booking : AuditableEntity
{
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string? Symptoms { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
}
