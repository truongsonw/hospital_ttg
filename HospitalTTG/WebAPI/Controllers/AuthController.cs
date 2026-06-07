using System.Security.Claims;
using Contracts.Auth.DTOs;
using Contracts.Auth.Interfaces;
using Modules.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> Login(LoginRequest request, CancellationToken ct)
    {
        var result = await _authService.LoginAsync(request, ct);
        return Ok(new ApiResponse<TokenResponse>(result, "Login successful"));
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Register(RegisterRequest request, CancellationToken ct)
    {
        await _authService.DisablePublicRegistrationAsync(ct);
        return Forbid();
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> RefreshToken([FromBody] string refreshToken, CancellationToken ct)
    {
        var result = await _authService.RefreshTokenAsync(refreshToken, ct);
        return Ok(new ApiResponse<TokenResponse>(result, "Token refreshed successfully"));
    }

    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<object>>> Logout(CancellationToken ct)
    {
        await _authService.LogoutAsync(GetCurrentUserId(), ct);
        return Ok(new ApiResponse<object>("Logged out successfully"));
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser(CancellationToken ct)
    {
        var result = await _authService.GetCurrentUserAsync(GetCurrentUserId(), ct);
        return Ok(new ApiResponse<UserDto>(result));
    }

    /// <summary>
    /// Returns the current authenticated user with their full permission set.
    /// Frontend should use this endpoint to drive route guards and permission checks
    /// instead of inferring permissions from the role string alone.
    /// </summary>
    [Authorize]
    [HttpGet("me/permissions")]
    [ProducesResponseType(typeof(ApiResponse<CurrentUserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<CurrentUserDto>>> GetCurrentUserWithPermissions(CancellationToken ct)
    {
        var result = await _authService.GetCurrentUserWithPermissionsAsync(GetCurrentUserId(), ct);
        return Ok(new ApiResponse<CurrentUserDto>(result));
    }

    [Authorize]
    [HttpPut("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateMyProfile(UpdateMyProfileRequest request, CancellationToken ct)
    {
        var result = await _authService.UpdateCurrentUserAsync(GetCurrentUserId(), request, ct);
        return Ok(new ApiResponse<UserDto>(result, "Cập nhật hồ sơ thành công."));
    }

    [Authorize]
    [HttpPut("change-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
    {
        await _authService.ChangePasswordAsync(GetCurrentUserId(), request, ct);
        return Ok(new ApiResponse<object>("Password changed successfully"));
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
