using Modules.System.Entities;

namespace Modules.System.Repositories;

public interface ISiteSettingRepository
{
    Task<IReadOnlyList<SiteSetting>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<SiteSetting>> GetByGroupAsync(string group, CancellationToken ct = default);
    Task<SiteSetting?> GetByKeyAsync(string key, CancellationToken ct = default);
    void Add(SiteSetting setting);
    void Update(SiteSetting setting);
}
