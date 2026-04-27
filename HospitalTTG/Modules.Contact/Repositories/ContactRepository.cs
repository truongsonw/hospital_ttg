using Contracts.Contact.Enums;
using Microsoft.EntityFrameworkCore;
using Shared.Infrastructure.Data;

namespace Modules.Contact.Repositories;

public class ContactRepository : BaseRepository<Entities.Contact>, IContactRepository
{
    public ContactRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<(IReadOnlyList<Entities.Contact> Items, int Total)> GetPagedAsync(
        ContactStatus? status, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var query = DbSet.AsNoTracking();

        if (status.HasValue)
            query = query.Where(x => x.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.FullName.Contains(search) || x.Email.Contains(search) || x.Subject.Contains(search));

        query = query.OrderByDescending(x => x.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return (items, total);
    }
}
