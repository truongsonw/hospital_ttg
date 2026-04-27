using Contracts.Booking.Enums;
using Microsoft.EntityFrameworkCore;
using Shared.Infrastructure.Data;

namespace Modules.Booking.Repositories;

public class BookingRepository : BaseRepository<Entities.Booking>, IBookingRepository
{
    public BookingRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<(IReadOnlyList<Entities.Booking> Items, int Total)> GetPagedAsync(
        BookingStatus? status, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var query = DbSet.AsNoTracking();

        if (status.HasValue)
            query = query.Where(x => x.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.FullName.Contains(search) || x.PhoneNumber.Contains(search));

        query = query.OrderByDescending(x => x.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return (items, total);
    }
}
