using Contracts.System.DTOs;

namespace Contracts.System.Interfaces;

public interface IDashboardStatsService
{
    Task<DashboardStatsDto> GetAsync(CancellationToken ct = default);
}
