using Modules.Booking.Entities;
using Shared.Infrastructure.Data;

namespace Modules.Booking.Repositories;

public class BookingRepository : BaseRepository<Entities.Booking>, IBookingRepository
{
    public BookingRepository(AppDbContext context) : base(context)
    {
    }
}
