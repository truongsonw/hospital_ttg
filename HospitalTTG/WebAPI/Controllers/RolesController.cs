using Modules.Auth;
using Contracts.Auth.DTOs;
using Contracts.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = Extensions.UserManagementPolicy)]
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