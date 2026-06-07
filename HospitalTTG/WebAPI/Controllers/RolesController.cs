using Contracts.Auth.DTOs;
using Contracts.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Modules.Auth;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = Permissions.RoleManage)]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RoleDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RoleDto>>>> GetAll(CancellationToken ct)
    {
        var result = await _roleService.GetAllAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<RoleDto>>(result));
    }

    [HttpGet("permissions")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RolePermissionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RolePermissionDto>>>> GetAllPermissions(CancellationToken ct)
    {
        var result = await _roleService.GetAllPermissionsAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<RolePermissionDto>>(result));
    }

    [HttpGet("{id}/permissions")]
    [ProducesResponseType(typeof(ApiResponse<RolePermissionAssignmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<RolePermissionAssignmentDto>>> GetPermissionAssignments(string id, CancellationToken ct)
    {
        var result = await _roleService.GetPermissionAssignmentsAsync(id, ct);
        return Ok(new ApiResponse<RolePermissionAssignmentDto>(result));
    }

    [HttpPost("{id}/permissions")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> AssignPermissions(string id, AssignRolePermissionsRequest request, CancellationToken ct)
    {
        request.RoleId = id;
        await _roleService.AssignPermissionsAsync(request, ct);
        return Ok(new ApiResponse<bool>(true, "Permissions assigned successfully"));
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<RoleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<RoleDto>>> GetById(string id, CancellationToken ct)
    {
        var role = await _roleService.GetByIdAsync(id, ct);
        if (role is null) return NotFound();
        return Ok(new ApiResponse<RoleDto>(role));
    }
}
