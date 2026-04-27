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
}
