using Contracts.System.DTOs;

namespace Contracts.System.Interfaces;

public interface ISysMenuService
{
    Task<IReadOnlyList<MenuDto>> GetAllMenusAsync(CancellationToken ct = default);
    Task<MenuDto> GetMenuByIdAsync(Guid id, CancellationToken ct = default);
    Task<MenuDto> CreateMenuAsync(CreateMenuRequest request, CancellationToken ct = default);
    Task<MenuDto> UpdateMenuAsync(Guid id, UpdateMenuRequest request, CancellationToken ct = default);
    Task DeleteMenuAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<MenuDto>> GetMenusByRoleAsync(string roleId, CancellationToken ct = default);
    Task AssignMenusToRoleAsync(AssignRoleMenuRequest request, CancellationToken ct = default);
}
