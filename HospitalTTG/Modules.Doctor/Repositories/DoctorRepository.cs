using Microsoft.EntityFrameworkCore;
using Shared.Infrastructure.Data;

namespace Modules.Doctor.Repositories;

public class DoctorRepository : BaseRepository<Entities.Doctor>, IDoctorRepository
{
    public DoctorRepository(AppDbContext context) : base(context) { }

    public async Task<(IReadOnlyList<Entities.Doctor> Items, int Total)> GetPagedAsync(
        IReadOnlyList<Guid>? departmentIds, string? search, int page, int pageSize, CancellationToken ct)
    {
        var query = DbSet.AsQueryable();

        if (departmentIds != null && departmentIds.Count > 0)
            query = query.Where(d => d.DepartmentId.HasValue && departmentIds.Contains(d.DepartmentId.Value));

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(d => d.FullName.Contains(search));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(d => d.SortOrder)
            .ThenBy(d => d.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<IReadOnlyList<Entities.Doctor>> GetFeaturedAsync(int limit, CancellationToken ct)
    {
        return await DbSet
            .Where(d => d.IsActive)
            .OrderBy(d => d.SortOrder)
            .ThenBy(d => d.FullName)
            .Take(limit)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Entities.Doctor>> GetManagementAsync(CancellationToken ct)
    {
        return await DbSet
            .Where(d => d.IsActive && d.IsManagement)
            .OrderBy(d => d.ManagementOrder)
            .ThenBy(d => d.FullName)
            .ToListAsync(ct);
    }
}
