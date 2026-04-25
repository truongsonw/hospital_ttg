using Contracts.System.DTOs;
using Contracts.System.Interfaces;
using Modules.System.Entities;
using Modules.System.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

namespace Modules.System.Services;

public class SysMenuService : ISysMenuService
{
    private readonly IMenuRepository _menuRepository;
    private readonly IRoleMenuRepository _roleMenuRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SysMenuService(IMenuRepository menuRepository, IRoleMenuRepository roleMenuRepository, IUnitOfWork unitOfWork)
    {
        _menuRepository = menuRepository;
        _roleMenuRepository = roleMenuRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MenuDto>> GetAllMenusAsync(CancellationToken ct = default)
    {
        var menus = await _menuRepository.GetAllAsync(ct);
        return BuildMenuTree(menus, null);
    }

    public async Task<MenuDto> GetMenuByIdAsync(Guid id, CancellationToken ct = default)
    {
        var menu = await _menuRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Menu", id.ToString());

        return MapToDto(menu);
    }

    public async Task<MenuDto> CreateMenuAsync(CreateMenuRequest request, CancellationToken ct = default)
    {
        if (request.ParentId.HasValue)
        {
            _ = await _menuRepository.GetByIdAsync(request.ParentId.Value, ct)
                ?? throw new NotFoundException("ParentMenu", request.ParentId.Value.ToString());
        }

        var menu = new Menu
        {
            ParentId = request.ParentId,
            Title = request.Title,
            Url = request.Url,
            Icon = request.Icon,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
        };

        await _menuRepository.AddAsync(menu, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(menu);
    }

    public async Task<MenuDto> UpdateMenuAsync(Guid id, UpdateMenuRequest request, CancellationToken ct = default)
    {
        var menu = await _menuRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Menu", id.ToString());

        if (request.ParentMenuId.HasValue && request.ParentMenuId.Value == id)
            throw new ValidationException(
                new Dictionary<string, string[]> { { "ParentMenuId", ["Menu cannot be its own parent."] } });

        if (request.ParentMenuId.HasValue)
        {
            _ = await _menuRepository.GetByIdAsync(request.ParentMenuId.Value, ct)
                ?? throw new NotFoundException("ParentMenu", request.ParentMenuId.Value.ToString());
        }

        menu.ParentId = request.ParentMenuId;
        menu.Title = request.Title;
        menu.Url = request.Url;
        menu.Icon = request.Icon;
        menu.SortOrder = request.SortOrder;
        menu.IsActive = request.IsActive;
        menu.UpdatedDate = DateTime.UtcNow;

        _menuRepository.Update(menu);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(menu);
    }

    public async Task DeleteMenuAsync(Guid id, CancellationToken ct = default)
    {
        var menu = await _menuRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Menu", id.ToString());

        var children = await _menuRepository.GetByParentIdAsync(id, ct);
        if (children.Count > 0)
            throw new ValidationException(
                new Dictionary<string, string[]> { { "Menu", ["Cannot delete menu that has children. Delete children first."] } });

        _menuRepository.Delete(menu);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<MenuDto>> GetMenusByRoleAsync(string roleId, CancellationToken ct = default)
    {
        var roleMenus = await _roleMenuRepository.GetByRoleIdAsync(roleId, ct);
        var assignedMenuIds = roleMenus
            .Where(rm => rm.CanView)
            .Select(rm => rm.MenuId)
            .ToHashSet();

        var allMenus = await _menuRepository.GetAllAsync(ct);
        var menuDict = allMenus.ToDictionary(m => m.Id);

        var includedIds = new HashSet<Guid>(assignedMenuIds);
        foreach (var menuId in assignedMenuIds)
        {
            var current = menuDict.GetValueOrDefault(menuId);
            while (current?.ParentId != null)
            {
                includedIds.Add(current.ParentId.Value);
                current = menuDict.GetValueOrDefault(current.ParentId.Value);
            }
        }

        var includedMenus = allMenus.Where(m => m.IsActive && includedIds.Contains(m.Id)).ToList();
        return BuildMenuTree(includedMenus, null);
    }

    public async Task AssignMenusToRoleAsync(AssignRoleMenuRequest request, CancellationToken ct = default)
    {
        var existing = await _roleMenuRepository.GetByRoleIdAsync(request.RoleId, ct);
        if (existing.Count > 0)
            _roleMenuRepository.DeleteRange(existing);

        foreach (var menuId in request.MenuIds)
        {
            _ = await _menuRepository.GetByIdAsync(menuId, ct)
                ?? throw new NotFoundException("Menu", menuId.ToString());

            await _roleMenuRepository.AddAsync(new RoleMenu
            {
                RoleId = request.RoleId,
                MenuId = menuId,
                CanView = true
            }, ct);
        }

        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static List<MenuDto> BuildMenuTree(IEnumerable<Menu> menus, Guid? parentId)
    {
        return menus
            .Where(m => m.ParentId == parentId)
            .OrderBy(m => m.SortOrder)
            .Select(m => new MenuDto
            {
                Id = m.Id,
                ParentId = m.ParentId,
                Title = m.Title,
                Url = m.Url,
                Icon = m.Icon,
                SortOrder = m.SortOrder,
                IsActive = m.IsActive,
                Children = BuildMenuTree(menus, m.Id)
            })
            .ToList();
    }

    private static MenuDto MapToDto(Menu menu)
    {
        return new MenuDto
        {
            Id = menu.Id,
            ParentId = menu.ParentId,
            Title = menu.Title,
            Url = menu.Url,
            Icon = menu.Icon,
            SortOrder = menu.SortOrder,
            IsActive = menu.IsActive,
        };
    }
}
