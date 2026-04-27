using Contracts.System.DTOs;

namespace Contracts.System.Interfaces;

public interface ISiteSettingService
{
    Task<IReadOnlyList<SiteSettingDto>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<SiteSettingDto>> GetByGroupAsync(string group, CancellationToken ct = default);
    Task<IReadOnlyList<SiteSettingDto>> UpsertAsync(UpdateSiteSettingsRequest request, string updatedBy, CancellationToken ct = default);
}
