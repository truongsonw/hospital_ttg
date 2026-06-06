using Microsoft.EntityFrameworkCore;
using Shared.Infrastructure.Data;

namespace Modules.Doctor.Repositories;

public class DepartmentRepository : BaseRepository<Entities.Department>, IDepartmentRepository
{
    public DepartmentRepository(AppDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Entities.Department>> GetAllAsync(bool? isActive, CancellationToken ct)
    {
        var query = DbSet.AsQueryable();
        if (isActive.HasValue) query = query.Where(d => d.IsActive == isActive.Value);
        return await query.OrderBy(d => d.SortOrder).ThenBy(d => d.Name).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Entities.Department>> GetChildrenAsync(Guid parentId, CancellationToken ct)
    {
        return await DbSet
            .Where(d => d.ParentId == parentId)
            .OrderBy(d => d.SortOrder).ThenBy(d => d.Name)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Entities.Department>> GetHomepageFeaturedAsync(int limit, CancellationToken ct)
    {
        return await DbSet
            .Where(d => d.IsActive && d.IsHomepageFeatured)
            .OrderBy(d => d.SortOrder).ThenBy(d => d.Name)
            .Take(limit)
            .ToListAsync(ct);
    }

    public async Task<Entities.Department?> GetBySlugAsync(string slug, CancellationToken ct)
    {
        return await DbSet.FirstOrDefaultAsync(d => d.Slug == slug, ct);
    }

    public async Task<IReadOnlyList<Guid>> GetChildrenIdsByGroupSlugAsync(string groupSlug, CancellationToken ct)
    {
        var group = await DbSet.FirstOrDefaultAsync(d => d.Slug == groupSlug, ct);
        if (group == null) return [];
        var children = await DbSet
            .Where(d => d.ParentId == group.Id)
            .Select(d => d.Id)
            .ToListAsync(ct);
        return children;
    }

    public async Task<IReadOnlyList<Entities.Department>> SearchAsync(string search, int limit, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(search))
            return [];

        return await DbSet
            .Where(d => d.IsActive && d.Name.Contains(search))
            .OrderBy(d => d.SortOrder)
            .ThenBy(d => d.Name)
            .Take(limit)
            .ToListAsync(ct);
    }

    public async Task<(IReadOnlyList<Entities.Department> Items, int Total)> SearchAsync(string search, int page, int pageSize, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(search))
            return ([], 0);

        var query = DbSet.Where(d => d.IsActive && d.Name.Contains(search));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(d => d.SortOrder)
            .ThenBy(d => d.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }
}
