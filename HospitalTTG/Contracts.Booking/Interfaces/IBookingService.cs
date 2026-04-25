using Contracts.Booking.DTOs;

namespace Contracts.Booking.Interfaces;

public interface IBookingService
{
    Task<BookingDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<BookingDto>> GetAllAsync(CancellationToken ct = default);
    Task<BookingDto> CreateAsync(CreateBookingRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
