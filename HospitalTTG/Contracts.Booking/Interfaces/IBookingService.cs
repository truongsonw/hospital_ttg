using Contracts.Booking.DTOs;
using Contracts.Booking.Enums;
using Shared.Abstractions.Responses;

namespace Contracts.Booking.Interfaces;

public interface IBookingService
{
    Task<BookingDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResponse<IReadOnlyList<BookingDto>>> GetPagedAsync(BookingStatus? status, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<BookingDto> CreateAsync(CreateBookingRequest request, CancellationToken ct = default);
    Task<BookingDto> UpdateStatusAsync(Guid id, UpdateBookingStatusRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
