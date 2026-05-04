using Contracts.System.DTOs;
using Contracts.System.Enums;
using Contracts.System.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SysMenuController : ControllerBase
{
    private readonly ISysMenuService _sysMenuService;

    public SysMenuController(ISysMenuService sysMenuService)
    {
        _sysMenuService = sysMenuService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<MenuDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<MenuDto>>>> GetAllMenus([FromQuery] MenuType? type, CancellationToken ct)
    {
        var result = await _sysMenuService.GetAllMenusAsync(type, ct);
        return Ok(new ApiResponse<IReadOnlyList<MenuDto>>(result));
    }

    [HttpGet("public")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<MenuDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<MenuDto>>>> GetPublicMenus(CancellationToken ct)
    {
        var result = await _sysMenuService.GetPublicMenusAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<MenuDto>>(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<MenuDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<MenuDto>>> GetMenuById(Guid id, CancellationToken ct)
    {
        var result = await _sysMenuService.GetMenuByIdAsync(id, ct);
        return Ok(new ApiResponse<MenuDto>(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<MenuDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<MenuDto>>> CreateMenu(CreateMenuRequest request, CancellationToken ct)
    {
        var result = await _sysMenuService.CreateMenuAsync(request, ct);
        return Created($"api/sysmenu/{result.Id}", new ApiResponse<MenuDto>(result, "Menu created successfully"));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<MenuDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<MenuDto>>> UpdateMenu(Guid id, UpdateMenuRequest request, CancellationToken ct)
    {
        var result = await _sysMenuService.UpdateMenuAsync(id, request, ct);
        return Ok(new ApiResponse<MenuDto>(result, "Menu updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteMenu(Guid id, CancellationToken ct)
    {
        await _sysMenuService.DeleteMenuAsync(id, ct);
        return Ok(new ApiResponse<bool>(true, "Menu deleted successfully"));
    }

    [HttpGet("role/{roleId}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<MenuDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<MenuDto>>>> GetMenusByRole(string roleId, CancellationToken ct)
    {
        var result = await _sysMenuService.GetMenusByRoleAsync(roleId, ct);
        return Ok(new ApiResponse<IReadOnlyList<MenuDto>>(result));
    }

    [HttpPost("role/assign")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> AssignMenusToRole(AssignRoleMenuRequest request, CancellationToken ct)
    {
        await _sysMenuService.AssignMenusToRoleAsync(request, ct);
        return Ok(new ApiResponse<bool>(true, "Menus assigned successfully"));
    }
}
