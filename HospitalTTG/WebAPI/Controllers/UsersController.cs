using System.Security.Claims;
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
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userManagementService;

    public UsersController(IUserManagementService userManagementService)
    {
        _userManagementService = userManagementService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<IReadOnlyList<UserListItemDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<IReadOnlyList<UserListItemDto>>>> GetPaged(
        [FromQuery] string? keyword,
        [FromQuery] string? role,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _userManagementService.GetPagedAsync(keyword, role, isActive, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _userManagementService.GetByIdAsync(id, ct);
        return Ok(new ApiResponse<UserDetailDto>(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserDetailDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> Create(CreateUserRequest request, CancellationToken ct)
    {
        var result = await _userManagementService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new ApiResponse<UserDetailDto>(result, "Tạo người dùng thành công."));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> Update(Guid id, UpdateUserRequest request, CancellationToken ct)
    {
        var result = await _userManagementService.UpdateAsync(id, request, ct);
        return Ok(new ApiResponse<UserDetailDto>(result, "Cập nhật người dùng thành công."));
    }

    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> UpdateStatus(Guid id, UpdateUserStatusRequest request, CancellationToken ct)
    {
        await _userManagementService.UpdateStatusAsync(id, request, GetCurrentUserId(), ct);
        return Ok(new ApiResponse<object>("Cập nhật trạng thái người dùng thành công."));
    }

    [HttpPatch("{id:guid}/reset-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword(Guid id, ResetUserPasswordRequest request, CancellationToken ct)
    {
        await _userManagementService.ResetPasswordAsync(id, request, GetCurrentUserId(), ct);
        return Ok(new ApiResponse<object>("Đặt lại mật khẩu thành công."));
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
