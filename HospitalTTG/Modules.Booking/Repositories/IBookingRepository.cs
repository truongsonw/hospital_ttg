using Contracts.Booking.Enums;
using Shared.Abstractions.Interfaces;

namespace Modules.Booking.Repositories;

public interface IBookingRepository : IRepository<Entities.Booking>
{
    Task<(IReadOnlyList<Entities.Booking> Items, int Total)> GetPagedAsync(
        BookingStatus? status, string? search, int page, int pageSize, CancellationToken ct = default);
}
