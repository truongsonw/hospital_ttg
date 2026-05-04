using Contracts.System.DTOs;

namespace Contracts.System.Interfaces;

public interface IHomePageService
{
    Task<HomePageDto> GetAsync(CancellationToken ct = default);
}
