using Contracts.System.DTOs;
using Contracts.System.Interfaces;
using Modules.System.Entities;
using Modules.System.Repositories;
using Shared.Abstractions.Interfaces;

namespace Modules.System.Services;

public class SiteSettingService : ISiteSettingService
{
    private readonly ISiteSettingRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public SiteSettingService(ISiteSettingRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SiteSettingDto>> GetAllAsync(CancellationToken ct = default)
    {
        var entities = await _repository.GetAllAsync(ct);
        return entities.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<SiteSettingDto>> GetByGroupAsync(string group, CancellationToken ct = default)
    {
        var entities = await _repository.GetByGroupAsync(group, ct);
        return entities.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<SiteSettingDto>> UpsertAsync(UpdateSiteSettingsRequest request, string updatedBy, CancellationToken ct = default)
    {
        foreach (var item in request.Settings)
        {
            var existing = await _repository.GetByKeyAsync(item.Key, ct);
            if (existing is null)
            {
                _repository.Add(new SiteSetting
                {
                    Id = Guid.NewGuid(),
                    Key = item.Key,
                    Value = item.Value,
                    Group = ResolveGroup(item.Key),
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = updatedBy
                });
            }
            else
            {
                existing.Value = item.Value;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = updatedBy;
                _repository.Update(existing);
            }
        }

        await _unitOfWork.SaveChangesAsync(ct);

        var all = await _repository.GetAllAsync(ct);
        return all.Select(MapToDto).ToList();
    }

    private static string ResolveGroup(string key) => key switch
    {
        "site_name" or "site_description" or "logo_url" or "copyright" => "general",
        "hotline" or "phone" or "email" or "address" or "working_hours" => "contact",
        "facebook" or "youtube" or "zalo" or "tiktok" => "social",
        "meta_title" or "meta_description" or "google_analytics_id" => "seo",
        var homepage when homepage.StartsWith("homepage_", StringComparison.OrdinalIgnoreCase) => "homepage",
        _ => "general"
    };

    private static SiteSettingDto MapToDto(SiteSetting entity) => new()
    {
        Key = entity.Key,
        Value = entity.Value,
        Group = entity.Group,
        UpdatedAt = entity.UpdatedAt,
        UpdatedBy = entity.UpdatedBy
    };
}
