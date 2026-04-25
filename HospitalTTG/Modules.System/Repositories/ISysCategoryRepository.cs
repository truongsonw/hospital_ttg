using Modules.System.Entities;

namespace Modules.System.Repositories;

public interface ISysCategoryRepository
{
    Task<IReadOnlyList<SysCategory>> GetAllAsync(CancellationToken ct = default);
    Task<SysCategory?> GetByIdAsync(Guid id, CancellationToken ct = default);
    void Add(SysCategory category);
    void Update(SysCategory category);
    void Delete(SysCategory category);
}
